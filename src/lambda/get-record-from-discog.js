const slugify = require('slugify');
const Discogs = require('disconnect').Client;
const _ = require('lodash');

export async function handler(event, context) {
  console.log('eeebbbb');
  console.log(event.body, typeof event.body);
  try {
    const dis = new Discogs({
      consumerKey: 'CCDUfPNAfvtEQfIzOKOb',
      consumerSecret: 'NbwwDMaYhcnLVBXflAJGUKcBcsFHUgbp',
    });

    const db = dis.database();

    const record = JSON.parse(event.body);

    let recordImage;
    const title = `${record.Artist} - ${record.Title}`;
    const release = await db
      .getRelease(record.release_id)
      .catch((e) => console.log('getRelease error', e));
    console.log('processing', release.id);

    recordImage = _.get(release, 'images.0.uri');

    const tracklist = release.tracklist
      .map((track) => `<span>${track.title}</span>`)
      .join('<br />');

    const recordLabel = _.get(release, 'labels.0.name');

    if (!recordImage) {
      const searchResults = await db.search({
        type: 'release',
        query: record.release_id,
      });
      recordImage = _.get(searchResults, 'results.0.thumb');
    }

    const barcode = (_.find(release.identifiers, { type: 'Barcode' }) || {})
      .value;

    const row = {
      Handle: slugify(title),
      Title: title,
      'Body (HTML)': tracklist,
      Vendor: recordLabel,
      Type: 'LP',
      Tags: null,
      Published: 'TRUE',
      'Option1 Name': 'Title',
      'Option1 Value': 'Default Title',
      'Option2 Name': null,
      'Option2 Value': null,
      'Option3 Name': null,
      'Option3 Value': null,
      'Variant SKU': null,
      'Variant Grams': 500,
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': 1,
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': record['Collection Notes'],
      'Variant Compare At Price': null,
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Variant Barcode': barcode,
      'Image Src': recordImage,
      'Image Position': 1,
      'Image Alt Text': title,
      'Gift Card': 'FALSE',
      'SEO Title': null,
      'SEO Description': null,
      'Google Shopping / Google Product Category': null,
      'Google Shopping / Gender': null,
      'Google Shopping / Age Group': null,
      'Google Shopping / MPN': null,
      'Google Shopping / AdWords Grouping': null,
      'Google Shopping / AdWords Labels': null,
      'Google Shopping / Condition': null,
      'Google Shopping / Custom Product': null,
      'Google Shopping / Custom Label 0': null,
      'Google Shopping / Custom Label 1': null,
      'Google Shopping / Custom Label 2': null,
      'Google Shopping / Custom Label 3': null,
      'Google Shopping / Custom Label 4': null,
      'Variant Image': null,
      'Variant Weight Unit': 'g',
      'Variant Tax Code': null,
      'Cost per item': null,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(row),
    };
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
}
