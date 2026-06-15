/**
 * Nav visibility rules by role + department.
 *
 * home / damInfo  — public
 * dashboard       — all logged-in users
 * commands        — Civil Division Officer
 * execution       — Civil/Mech Sub-Division Officer  OR  Mech Division Officer
 * logbook         — all logged-in users
 * alerts          — all logged-in users
 * admin           — Super Admin only
 */
export function canSeeNav(key, { loggedIn, role, dept }) {
  if (key === 'home' || key === 'damInfo') return true;
  if (!loggedIn) return false;
  if (role === 'superadmin') return true;

  switch (key) {
    case 'dashboard': return true;
    case 'commands':  return role === 'division' && dept === 'civil';
    case 'execution': return (role === 'subdivision' && (dept === 'civil' || dept === 'mechanical'))
                          || (role === 'division'    && dept === 'mechanical');
    case 'logbook':
    case 'alerts':    return true;
    default:          return false;
  }
}
