'use client';

/**
 * KendoReact AppBar + Drawer shell. Marked 'use client' because the Drawer
 * keeps open/closed state and reads the current route - everything inside
 * <AppShell>{children}</AppShell> is still rendered on the server.
 */
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppBar, AppBarSection, AppBarSpacer, Drawer, DrawerContent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import {
  menuIcon, gridIcon, calendarIcon, chartColumnClusteredIcon,
  folderIcon, fileReportIcon, plusIcon
} from '@progress/kendo-svg-icons';

const items = [
  { text: 'Dashboard', svgIcon: chartColumnClusteredIcon, route: '/' },
  { text: 'Tasks', svgIcon: gridIcon, route: '/tasks' },
  { text: 'Projects', svgIcon: folderIcon, route: '/projects' },
  { text: 'Analytics', svgIcon: chartColumnClusteredIcon, route: '/analytics' },
  { text: 'Schedule', svgIcon: calendarIcon, route: '/schedule' },
  { text: 'Reports', svgIcon: fileReportIcon, route: '/reports' }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const selected = items.findIndex(i =>
    i.route === '/' ? pathname === '/' : pathname.startsWith(i.route)
  );

  return (
    <div className="portal-shell">
      <AppBar themeColor="inverse" style={{ background: 'var(--brand)' }}>
        <AppBarSection>
          <Button
            svgIcon={menuIcon}
            fillMode="flat"
            themeColor="inverse"
            onClick={() => setExpanded(e => !e)}
            aria-label="Toggle navigation"
          />
        </AppBarSection>
        <AppBarSection>
          <strong style={{ fontSize: 16 }}>Enterprise Task Portal</strong>
        </AppBarSection>
        <AppBarSpacer />
        <AppBarSection>
          <Button
            svgIcon={plusIcon}
            themeColor="base"
            fillMode="solid"
            onClick={() => router.push('/tasks/new')}
          >
            New task
          </Button>
        </AppBarSection>
      </AppBar>

      <div className="portal-body">
        <Drawer
          expanded={expanded}
          position="start"
          mode="push"
          mini
          items={items.map((item, index) => ({ ...item, selected: index === selected }))}
          onSelect={e => router.push(items[e.itemIndex].route)}
          style={{ flex: 1 }}
        >
          <DrawerContent>
            <main className="portal-content">{children}</main>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
