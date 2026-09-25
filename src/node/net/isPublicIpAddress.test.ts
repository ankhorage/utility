import { describe, expect, test } from 'bun:test';

import { isPublicIpAddress } from './isPublicIpAddress.js';

describe('public IP classification', () => {
  test('accepts public IPv4 and IPv6 addresses', () => {
    expect(isPublicIpAddress('1.1.1.1')).toBe(true);
    expect(isPublicIpAddress('8.8.8.8')).toBe(true);
    expect(isPublicIpAddress('2606:4700:4700::1111')).toBe(true);
  });

  test('rejects non-public IPv4 ranges', () => {
    for (const address of [
      '0.0.0.0',
      '10.0.0.1',
      '100.64.0.1',
      '127.0.0.1',
      '169.254.169.254',
      '172.16.0.1',
      '192.0.2.1',
      '192.168.1.1',
      '198.18.0.1',
      '198.51.100.1',
      '203.0.113.1',
      '224.0.0.1',
      '255.255.255.255',
    ]) {
      expect(isPublicIpAddress(address)).toBe(false);
    }
  });

  test('rejects non-public IPv6 ranges', () => {
    for (const address of [
      '::',
      '::1',
      '64:ff9b::1',
      '100::1',
      '2001:db8::1',
      '2002::1',
      '3fff::1',
      'fc00::1',
      'fe80::1',
      'ff00::1',
    ]) {
      expect(isPublicIpAddress(address)).toBe(false);
    }
  });

  test('rejects non-IP input', () => {
    expect(isPublicIpAddress('example.com')).toBe(false);
  });
});
