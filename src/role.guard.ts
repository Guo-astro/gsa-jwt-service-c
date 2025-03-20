import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as https from 'https';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly serviceAccountEmail: string;

  constructor(private configService: ConfigService) {
    const email = this.configService.get<string>('client_email'); // Match Service B's key
    if (!email) {
      throw new Error('Service account email is not configured');
    }
    this.serviceAccountEmail = email;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
      console.log('No token provided');
      return false;
    }

    try {
      const certs = await this.getCerts();
      console.log('Fetched certificates:', Object.keys(certs)); // Debug certificates

      // Decode token header to get kid
      const decodedHeader = jwt.decode(token, { complete: true })?.header;
      console.log('Token header:', decodedHeader); // Debug token header

      const publicKey = certs[decodedHeader?.kid];
      if (!publicKey) {
        throw new Error(`No matching public key found for kid: ${decodedHeader?.kid}`);
      }

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        audience: 'http://localhost:3001',
        issuer: this.serviceAccountEmail,
      }) as { role?: string };

      return decoded.role === 'admin';
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return false;
    }
  }

  private async getCerts(): Promise<{ [key: string]: string }> {
    return new Promise((resolve, reject) => {
      https
        .get(
          `https://www.googleapis.com/service_accounts/v1/metadata/x509/${this.serviceAccountEmail}`,
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const certs = JSON.parse(data);
                resolve(certs);
              } catch (error) {
                reject(error);
              }
            });
          }
        )
        .on('error', reject);
    });
  }
}