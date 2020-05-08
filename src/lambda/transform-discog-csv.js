const parser = require('lambda-multipart-parser');
const parseDiscogs = require('../utils/parse-discogs-csv-to-shopify-csv')
  .default;

export async function handler(event, context) {
  try {
    const result = await parser.parse(event);
    const newCsv = await parseDiscogs(result.files[0]);
    console.log('newCsv');
    console.log(newCsv);
    return {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition':
          'attachment; filename="' + 'discog-shopify-' + Date.now() + '.csv"',
      },
      statusCode: 200,
      body: newCsv,
    };
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
}
