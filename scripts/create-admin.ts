/**
 * Creates the first platform AdminUser for the Stokko backoffice.
 *
 *   pnpm create-admin -- \
 *     --email "admin@stokko.io" \
 *     --password "YourSecurePass123!"
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/domain/admin/admin-users.service';

interface CliArgs {
  email?: string;
  password?: string;
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
  const email = requireArg(args.email, 'email');
  const password = requireArg(args.password, 'password');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const adminUsers = app.get(AdminUsersService);

    const existing = await adminUsers.findByEmail(email);
    if (existing) {
      console.error(`Admin with email "${email}" already exists.`);
      process.exitCode = 1;
      return;
    }

    const admin = await adminUsers.create(email, password);

    console.log('');
    console.log('────────────────────────────────────────');
    console.log(' Stokko · platform admin created');
    console.log('────────────────────────────────────────');
    console.log(` Email: ${admin.email}`);
    console.log(`    id: ${admin.id}`);
    console.log('');
    console.log(' Use these credentials to log in at /admin/auth/login');
    console.log('────────────────────────────────────────');
    console.log('');
  } catch (err) {
    console.error('Failed to create admin user:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
