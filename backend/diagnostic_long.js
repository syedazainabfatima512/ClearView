const https = require('https');
require('dotenv').config();

const key = process.env.LLM_API_KEY;
const baseUrl = process.env.LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const fs = require('fs');

function checkUrl(url, label) {
    return new Promise((resolve) => {
        console.log(`Checking ${label}...`);
        const request = https.get(`${url}`, {
            headers: {
                Authorization: `Bearer ${key}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const models = (json.data || []).map(m => ({
                            id: m.id,
                            created: m.created,
                            ownedBy: m.owned_by
                        }));
                        fs.appendFileSync('models_list.json', label + ": " + JSON.stringify(models, null, 2) + "\n\n");
                        console.log(`${label} listed.`);
                    } catch (e) {
                        console.log(`${label} SUCCESS but parse error:`, e.message);
                    }
                } else {
                    console.log(`${label} FAILED with status ${res.statusCode}: ${data}`);
                }
                resolve();
            });
        });

        request.on('error', (e) => {
            console.log(`${label} REQUEST ERROR:`, e.message);
            resolve();
        });
    });
}

async function run() {
    if (fs.existsSync('models_list.json')) fs.unlinkSync('models_list.json');
    await checkUrl(`${baseUrl}/models`, 'Configured LLM API');
}

run();
