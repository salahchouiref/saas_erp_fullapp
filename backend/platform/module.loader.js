const fs = require('fs');
const path = require('path');

function loadModules(modulesDir, app, io) {
  const loaded = [];

  if (!fs.existsSync(modulesDir)) {
    console.warn(`Modules directory not found: ${modulesDir}`);
    return loaded;
  }

  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });
  const moduleDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  for (const dirName of moduleDirs) {
    const modulePath = path.join(modulesDir, dirName);
    const indexFile = path.join(modulePath, 'index.js');

    if (fs.existsSync(indexFile)) {
      try {
        const mod = require(indexFile);
        const moduleName = mod.name || dirName;

        if (typeof mod.register === 'function') {
          mod.register(app, io);
        }

        if (mod.routes && typeof mod.mountRoutes === 'function') {
          mod.mountRoutes(app);
        } else if (mod.router) {
          const mountPath = mod.mountPath || `/api/${dirName}`;
          app.use(mountPath, mod.router);
        }

        loaded.push({
          name: moduleName,
          path: modulePath,
          enabled: true,
          models: mod.models || [],
          routes: mod.routes || []
        });

        console.log(`Module loaded: ${moduleName}`);
      } catch (err) {
        console.error(`Failed to load module at ${modulePath}:`, err.message);
      }
    }
  }

  return loaded;
}

module.exports = { loadModules };
