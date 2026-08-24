import { getContent } from '@/lib/site-content';
import { HeaderShell } from './header-shell';

/**
 * Server wrapper: reads the announcement bar (which Prisca edits in /studio)
 * and hands it to the interactive shell.
 */
export async function SiteHeader() {
  const announcement = await getContent('site.announcement');
  return <HeaderShell announcement={announcement} />;
}
