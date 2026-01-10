# Troubleshooting Guide

## Common Issues and Solutions

### Vite Module Resolution Error

**Error Message:**
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

**Cause:**
This error typically occurs when:
1. The Vite installation is corrupted
2. There's a version mismatch between Vite and its dependencies
3. The node_modules cache is stale

**Solution:**
The package.json has been configured with exact versions for Vite (6.4.1) and Rollup (4.55.1) to prevent version conflicts. The vite.config.ts has also been simplified to avoid resolution issues.

If you continue to experience this error in a development environment:
1. Delete the `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install`
4. Clear the Vite cache: `rm -rf node_modules/.vite`

### Module Loading Errors

**Symptoms:**
- Dashboard modules fail to load
- "Failed to load this module" messages
- Blank screens when navigating to different sections

**Solution:**
The application uses React lazy loading with Suspense. If modules fail to load:
1. Check browser console for specific errors
2. Ensure all component files exist in `/src/components/`
3. Verify imports in `App.tsx` match actual file exports
4. Clear browser cache and reload

### React Initialization Errors

**Symptoms:**
- Application fails to start
- "Cannot read properties of null" errors
- Hooks-related errors

**Solution:**
The application includes comprehensive error boundaries and initialization checks:
- `AppWrapper.tsx` validates Spark runtime availability
- `ReactInitializer.tsx` ensures proper React mounting
- `ErrorFallback.tsx` provides user-friendly error messages

If you see initialization errors:
1. Refresh the page
2. Clear browser cache
3. Check that `window.spark` is available in browser console
4. Verify React version compatibility (currently using React 19)

### TypeScript Errors

**Common Issues:**
- Type mismatches
- Missing type definitions
- Import resolution errors

**Solution:**
1. Run `npm run build` to check for TypeScript errors
2. Ensure tsconfig.json paths are correct
3. Check that all imports use the `@/` alias correctly
4. Verify component props match their type definitions

### Performance Issues

**Symptoms:**
- Slow page loads
- Laggy interactions
- High memory usage

**Solution:**
The application uses several optimization techniques:
- Lazy loading of major modules
- React Suspense for code splitting
- Optimized dependency resolution in vite.config.ts

To improve performance:
1. Use the production build: `npm run build && npm run preview`
2. Monitor Network tab for large bundle sizes
3. Check React DevTools Profiler for slow components
4. Ensure `useKV` is used with functional updates

### Data Persistence Issues

**Symptoms:**
- Data not saving between sessions
- Lost user preferences
- Reset application state

**Solution:**
The application uses the Spark KV store for persistence:
- Always use `useKV` hook for persistent data
- Use functional updates: `setData(current => ...)`
- Never reference closure values directly in setters
- Check browser DevTools > Application > IndexedDB for stored data

## Getting Help

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Review the error stack trace
3. Verify all dependencies are installed: `npm list`
4. Check that you're using Node.js version 18 or higher
5. Ensure the Spark runtime is properly configured

## Version Information

- React: 19.0.0
- Vite: 6.4.1
- TypeScript: 5.7.2
- Node: 18+

Last updated: 2026-01-10
