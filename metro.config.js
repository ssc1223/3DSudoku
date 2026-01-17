
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve "three" to the one in the root node_modules to avoid "Multiple instances of Three.js" error
config.resolver.extraNodeModules = {
    three: path.resolve(__dirname, 'node_modules/three'),
};

config.transformer.getTransformOptions = async () => ({
    transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
    },
});

module.exports = config;
