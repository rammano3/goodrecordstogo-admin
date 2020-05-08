const _ = require('lodash');
const Promise = require('bluebird');
const Discogs = require('disconnect').Client;
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const slugify = require('slugify');
const pLimit = require('p-limit');

export default async (inputCsv) => {
  console.log('-SSSS');
  // Authenticate by consumer key and secret
  // TODO: env variables
  const dis = new Discogs({
    consumerKey: 'CCDUfPNAfvtEQfIzOKOb',
    consumerSecret: 'NbwwDMaYhcnLVBXflAJGUKcBcsFHUgbp',
  });

  const db = dis.database();

  const records = parse(inputCsv.content, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Processing ${records.length} records`);

  const newRecords = await Promise.mapSeries(records, async function (record) {
    let recordImage;
    const title = `${record.Artist} - ${record.Title}`;
    const release = await db
      .getRelease(record.release_id)
      .catch((e) => console.log('ERROR', error));
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

    await Promise.delay(1000);

    return {
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
  });

  const data = stringify(newRecords, {
    header: true,
    columns: [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Option2 Name',
      'Option2 Value',
      'Option3 Name',
      'Option3 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Variant Barcode',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Gift Card',
      'SEO Title',
      'SEO Description',
      'Google Shopping / Google Product Category',
      'Google Shopping / Gender',
      'Google Shopping / Age Group',
      'Google Shopping / MPN',
      'Google Shopping / AdWords Grouping',
      'Google Shopping / AdWords Labels',
      'Google Shopping / Condition',
      'Google Shopping / Custom Product',
      'Google Shopping / Custom Label 0',
      'Google Shopping / Custom Label 1',
      'Google Shopping / Custom Label 2',
      'Google Shopping / Custom Label 3',
      'Google Shopping / Custom Label 4',
      'Variant Image',
      'Variant Weight Unit',
      'Variant Tax Code',
      'Cost per item',
    ],
  });

  return data;
};
