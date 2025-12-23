
import { FirestoreService } from './src/services/firebase.service';
import { sites } from './src/data/location/mockData';

async function checkInventory() {
    console.log("Fetching Inventory from Firestore...");
    try {
        const inventories: any[] = await FirestoreService.getAll('inventoryItems');
        console.log(`[TEST] Total Inventory Records: ${inventories.length}`);

        // Check Site 1 (HUP) for Keytruda (known shortage in mockData)
        const hupInv = inventories.find(inv => inv.siteId === 'site-1');
        if (hupInv) {
            const keytruda = hupInv.drugs.find((d: any) => d.drugName.includes('Keytruda'));
            if (keytruda) {
                console.log(`[TEST] Site 1 (HUP) Keytruda Stock: ${keytruda.quantity}`);
                console.log(`[TEST] EXPECTED (Mock Baseline): 0-2`);
                if (keytruda.quantity > 5) {
                    console.error("FAIL: Inventory is POLLUTED (Too High). Suggest Reset.");
                } else {
                    console.log("SUCCESS: Inventory is low/correct.");
                }
            } else {
                console.log("[TEST] Keytruda not found in Site 1 Inventory.");
            }
        } else {
            console.log("[TEST] Site 1 Inventory Not Found.");
        }

    } catch (error) {
        console.error("Error fetching inventory:", error);
    }
    process.exit(0);
}

checkInventory();
