async function clothFirefox(assetID) {
    let AssetUrl = "https://assetdelivery.roblox.com/v1/assetId/" + assetID;
    const JSONresponse = await fetch(AssetUrl);
    const JSONdata = await JSONresponse.json();
    // Parse XML Data
    const XMLresponse = await fetch(JSONdata["location"]);
    const XMLdata = await XMLresponse.text();
    let Xmlparser = new DOMParser();
    let xmlDoc = Xmlparser.parseFromString(XMLdata, "text/xml");
    // Check If Item Type Is Supported
    const AllowedItemTypes = ["Pants", "Shirt", "Shirt Graphic"];
    let xmlItemType = xmlDoc.getElementsByTagName("string")[0].childNodes[0].nodeValue;
    if (AllowedItemTypes.includes(xmlItemType)) {
        let xmlUrl = xmlDoc.getElementsByTagName("url")[0];
        let parXML = xmlUrl.childNodes[0].nodeValue;
        if (parXML) {
            // Parse Library Page To Get Image Url
            let url = "https://www.roblox.com/library/" + parXML.split("?id=").pop();
            const LibraryRes = await fetch(url);
            const LibraryData = await LibraryRes.text();
            let Libparser = new DOMParser();
            let libDoc = Libparser.parseFromString(LibraryData, "text/html");
            let thumbnailSpan = libDoc.getElementsByClassName("thumbnail-span")[0];
            let img = thumbnailSpan.getElementsByTagName("img")[0];
            let itemName = libDoc.title.split(" - Roblox")[0];
            return [img.src, itemName];
        } else { return null };
    };
};
browser.action.onClicked.addListener(async (tab) => {
    let step1 = tab.url.split('catalog/').pop();
    if (step1) {
        let assetLocation = step1.split("/")[0];
        if (!isNaN(assetLocation)) {
            await browser.scripting.executeScript({
                target: {tabId: tab.id},
                func: clothFirefox,
                args: [assetLocation]
            }).then(injectionResults => {
                if (injectionResults) {
                    const { fId, result } = injectionResults[0];
                    if (result) {
                        browser.downloads.download({ url: result[0], filename: result[1] + ".png"} );
                    };
                };
            });
        };
    };
});