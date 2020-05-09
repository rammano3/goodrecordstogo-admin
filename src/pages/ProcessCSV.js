import React, { useState } from 'react';
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const Promise = require('bluebird');

function downloadFile(fileName, urlData) {
  var aLink = document.createElement('a');
  aLink.download = fileName;
  aLink.href = urlData;

  var event = new MouseEvent('click');
  aLink.dispatchEvent(event);
}

function ProcessCSV() {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const records = parse(event.target.result, {
        columns: true,
        skip_empty_lines: true,
      });
      const newRecords = await Promise.mapSeries(records, async function (
        record
      ) {
        const response = await fetch(
          '/.netlify/functions/get-record-from-discog',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
          }
        );

        await Promise.delay(1000);
        return response.json();
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

      setLoading(false);
      setIsDone(true);
      downloadFile(
        `discog-shopify-${Date.now()}.csv`,
        'data:text/csv;charset=UTF-8,' + encodeURIComponent(data)
      );
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h2>Upload CSV</h2>
      {isDone && <div>Conversion Done, check your downloads</div>}
      {!isDone && (
        <div>
          {!loading && (
            <input type="file" name="file" onChange={handleFileChange} />
          )}
          {loading && <div class="lds-hourglass"></div>}
          {!loading && file && (
            <button onClick={handleUpload}>Convert CSV</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProcessCSV;
