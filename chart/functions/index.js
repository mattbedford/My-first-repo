//This represents an API endpoint - basically /.netlify/functions/index
//Upon calling it does a few checks, then if all OK, submuits a data send request to Notion, where our DB is at


const { Client, LogLevel } = require('@notionhq/client');

const { NOTION_API_TOKEN, NOTION_DATABASE_ID } = process.env;

async function addChartData(newData) {
  // Initialize Notion client
  const notion = new Client({
    auth: NOTION_API_TOKEN,
    logLevel: LogLevel.DEBUG,
  });

  await notion.pages.create({
    parent: {
      database_id: NOTION_DATABASE_ID,
    },
    properties: {
      chartData: {
        title: [
          {
            text: {
              content: newData,
            },
          },
        ],
      },
    },
  });
}


module.exports.handler = async function (event, context) {
  // Check the request method
  if (event.httpMethod != 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Get the body
  try {
    var body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: err.toString(),
    };
    return;
  }

  // capture the data
  const { newData } = body;

  // Store data in Notion
  await addChartData(newData);
  return { statusCode: 200, body: 'ok' };
};