const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const defaultconfig = getDefaultConfig(__dirname)
defaultconfig.resolver.sourceExts.push('cjs');
defaultconfig.resolver.unstable_enablePackageExports=false;
module.exports = withNativeWind(defaultconfig, { input: './global.css' })