#!/usr/bin/env node
var program = require("commander");
var plist = require("plist");
var util = require('util');
var fs = require('fs');

program
    .version("1.0.0", '-v, --version')

    .option("--method <method>",
        "Describes how Xcode should export the archive. Available options: app-store, ad-hoc, package, enterprise, development, developer-id, and mac-application. The list of options varies based on the type of archive. Defaults to development.",
        /^(app-store|ad-hoc|package|enterprise|development|developer-id|mac-application)$/i, 'development')

    .option("--compileBitcode <compileBitcode>",
        "For non-App Store exports, should Xcode re-compile the app from bitcode? Defaults to YES.", /^(true|false)$/i, 'true')

    .option("--embedOnDemandResourcesAssetPacksInBundle <embedOnDemandResourcesAssetPacksInBundle>",
        "For non-App Store exports, if the app uses On Demand Resources and this is YES, asset packs are embedded in the app bundle so that the app can be tested without a server to host asset packs. Defaults to YES unless onDemandResourcesAssetPacksBaseURL is specified.", /^(true|false)$/i, 'true')

    .option("--iCloudContainerEnvironment <iCloudContainerEnvironment>",
        `If the app is using CloudKit, this configures the "com.apple.developer.icloud-container-environment" entitlement. Available options vary depending on the type of provisioning profile used, but may include: Development and Production.`)

    .option("--installerSigningCertificate <installerSigningCertificate>",
        `For manual signing only. Provide a certificate name, SHA-1 hash, or automatic selector to use for signing. Automatic selectors allow Xcode to pick the newest installed certificate of a particular type. The available automatic selectors are "Mac Installer Distribution" and "Developer ID Installer". Defaults to an automatic certificate selector matching the current distribution method.`)

    .option("--onDemandResourcesAssetPacksBaseURL <onDemandResourcesAssetPacksBaseURL>",
        `For non-App Store exports, if the app uses On Demand Resources and embedOnDemandResourcesAssetPacksInBundle isn't YES, this should be a base URL specifying where asset packs are going to be hosted. This configures the app to download asset packs from the specified URL.`)

    .option("--signingCertificate <signingCertificate>",
        `For manual signing only. Provide a certificate name, SHA-1 hash, or automatic selector to use for signing. Automatic selectors allow Xcode to pick the newest installed certificate of a particular type. The available automatic selectors are "Mac App Distribution", "iOS Developer", "iOS Distribution", "Developer ID Application", and "Mac Developer". Defaults to an automatic certificate selector matching the current distribution method.`)

    .option("--signingStyle <signingStyle>",
        `The signing style to use when re-signing the app for distribution. Options are manual or automatic. Apps that were automatically signed when archived can be signed manually or automatically during distribution, and default to automatic. Apps that were manually signed when archived must be manually signed during distribtion, so the value of signingStyle is ignored.`)

    .option("--stripSwiftSymbols <stripSwiftSymbols>",
        `Should symbols be stripped from Swift libraries in your IPA? Defaults to YES.`, /^(true|false)$/i, 'true')

    .option("--teamID <teamID>",
        `The Developer Portal team to use for this export. Defaults to the team used to build the archive.`)

    .option("--thinning <thinning>",
        `For non-App Store exports, should Xcode thin the package for one or more device variants? Available options: <none> (Xcode produces a non-thinned universal app), <thin-for-all-variants> (Xcode produces a universal app and all available thinned variants), or a model identifier for a specific device (e.g. "iPhone7,1"). Defaults to <none>.`)

    .option("--uploadBitcode <uploadBitcode>",
        `For App Store exports, should the package include bitcode? Defaults to YES.`, /^(true|false)$/i, 'true')

    .option("--uploadSymbols <uploadSymbols>",
        `For App Store exports, should the package include symbols? Defaults to YES.`, /^(true|false)$/i, 'true')
    .parse(process.argv);

const exportOptions = {
    method: program.method,
    compileBitcode: program.compileBitcode === 'true' ? true : false,
    embedOnDemandResourcesAssetPacksInBundle: program.embedOnDemandResourcesAssetPacksInBundle === 'true' ? true : false,
    iCloudContainerEnvironment: program.iCloudContainerEnvironment,
    installerSigningCertificate: program.installerSigningCertificate,
    onDemandResourcesAssetPacksBaseURL: program.onDemandResourcesAssetPacksBaseURL,
    signingCertificate: program.signingCertificate,
    signingStyle: program.signingStyle,
    stripSwiftSymbols: program.stripSwiftSymbols === 'true' ? true : false,
    teamID: program.teamID,
    thinning: program.thinning,
    uploadBitcode: program.uploadBitcode === 'true' ? true : false,
    uploadSymbols: program.uploadSymbols === 'true' ? true : false
}

Object.keys(exportOptions).forEach(key => {

    if (util.isNullOrUndefined(exportOptions[key])) {
        delete exportOptions[key];
    }
});

const manifest = plist.build(exportOptions);

fs.writeFile('exportOptions.plist', manifest, (err) => {
    if (err) {
        console.log("something went wrong while creating exportOption file");
        process.exit(100);
    } else {
        process.exit(0);
    }
})