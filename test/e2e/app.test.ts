import { test, describe, expect, it } from 'vitest';
import { $fetch, setup, createPage, url } from '@nuxt/test-utils/e2e';

describe('app,', async () => {
	await setup();

	it('contains Welcome text with playwright', async () => {
		const page = await createPage('/');
		await page.goto(url('/'), { waitUntil: 'hydration' });
		const text = await page.textContent('p');
		expect(text).toContain('Cassowary is a planner for Wuthering Waves');
	});
});
