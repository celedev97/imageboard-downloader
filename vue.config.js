module.exports = {
    configureWebpack: {
        devtool: 'source-map'
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                appId: "dev.cele.hdownloader",

                win: {

                },
                nsis: {
                    artifactName: "${productName}_${version}.${ext}"
                },

                linux: {
                    target: "deb"
                },
                deb: {
                    artifactName: "${productName}_${version}.${ext}"
                }

            },
        }
    }
}