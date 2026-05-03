/**
 * Super-admin CLI: provisions a new Organization + first Owner.
 *
 *   pnpm create-org -- \
 *     --name "Burger Place" \
 *     --ownerEmail "owner@example.com" \
 *     --firstName "Marko" \
 *     --lastName "Horvat" \
 *     [--currency EUR]
 *
 * Prints the generated temporary password to stdout. The Owner uses it
 * once to log in and is forced to change it immediately.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/data/common/prisma/prisma.service';
import { CategoriesService } from '../src/domain/categories/categories.service';
import { Role } from '../src/domain/common/role';
import { OrganizationsService } from '../src/domain/organizations/organizations.service';
import { UsersService } from '../src/domain/users/users.service';

interface CliArgs {
  name?: string;
  ownerEmail?: string;
  firstName?: string;
  lastName?: string;
  currency?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      out[key] = next;
      i++;
    } else {
      out[key] = 'true';
    }
  }
  return out as CliArgs;
}

function requireArg(value: string | undefined, name: string): string {
  if (!value || value === 'true') {
    console.error(`Missing required arg: --${name}`);
    process.exit(2);
  }
  return value;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const orgName = requireArg(args.name, 'name');
  const ownerEmail = requireArg(args.ownerEmail, 'ownerEmail');
  const firstName = requireArg(args.firstName, 'firstName');
  const lastName = requireArg(args.lastName, 'lastName');
  const currency = args.currency ?? 'EUR';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const prisma = app.get(PrismaService);
    const orgs = app.get(OrganizationsService);
    const users = app.get(UsersService);
    const categories = app.get(CategoriesService);

    const result = await prisma.$transaction(async (tx) => {
      const org = await orgs.create({ name: orgName, currency }, tx);
      const invite = await users.invite(
        {
          organizationId: org.id,
          email: ownerEmail,
          firstName,
          lastName,
          role: Role.OWNER,
        },
        null,
        tx,
      );
      const seeded = await categories.seedPredefined(org.id, invite.user.id, tx);
      return { org, ...invite, seededCategories: seeded.length };
    });

    console.log('');
    console.log('────────────────────────────────────────');
    console.log(' Stokko · organization created');
    console.log('────────────────────────────────────────');
    console.log(` Organization: ${result.org.name}`);
    console.log(`           id: ${result.org.id}`);
    console.log(`     currency: ${result.org.currency}`);
    console.log('');
    console.log(` Owner:        ${result.user.fullName()}`);
    console.log(`        email: ${result.user.email}`);
    console.log(`           id: ${result.user.id}`);
    console.log('');
    console.log(` Categories seeded: ${result.seededCategories}`);
    console.log('');
    console.log(` Temporary password (give to Owner):`);
    console.log(`     ${result.temporaryPassword}`);
    console.log('');
    console.log(' Owner must change this on first login.');
    console.log('────────────────────────────────────────');
    console.log('');
  } catch (err) {
    console.error('Failed to create organization:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
