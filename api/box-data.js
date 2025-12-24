export default async function handler(req, res) {
    // 1. Authenticate (Vercel manages the Secret Key)
    const boxToken = process.env.BOX_DEVELOPER_TOKEN;

    // 2. Safety Check
    if (!boxToken) {
        return res.status(500).json({ error: 'Server misconfigured: Missing Box Token' });
    }

    try {
        // 3. Request Data from Box (Server-to-Server)
        // Note: We use the explicit Box File ID or Search endpoint here.
        // For now, we proxy usage of the "Files" endpoint as a generic integration.
        // In production, you might want to hardcode specific File IDs for safety.
        const externalResponse = await fetch('https://api.box.com/2.0/folders/0/items', {
            headers: {
                'Authorization': `Bearer ${boxToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!externalResponse.ok) {
            throw new Error(`Box API Error: ${externalResponse.status}`);
        }

        const data = await externalResponse.json();

        // 4. Return Data to Frontend
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
