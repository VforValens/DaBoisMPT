import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IInsuranceConfig } from "@spt-aki/models/spt/config/IInsuranceConfig";

class Bois implements IPostDBLoadMod {
    public postDBLoad(container: DependencyContainer): void {
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const insuranceConfig: IInsuranceConfig = configServer.getConfig<IInsuranceConfig>(ConfigTypes.INSURANCE);


        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // ---------------------------------------------------------
        // Get globals settings and set flea market min level to be 10
        tables.globals.config.RagFair.minUserLevel = 10;

        // Get globals settings and set flea market to sell non-FIR items.
        tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = false;

        // ---------------------------------------------------------
        // Example #3
        // Loop over all magazines and make them weigh nothing

        // Get ItemHelper ready to use
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");

        // Get all items in the database as an array so we can loop over them later
        // tables.templates.items is a dictionary, the key being the items template id, the value being the objects data,
        // we want to convert it into an array so we can loop over all the items easily
        // Object.values lets us grab the 'value' part as an array and ignore the 'key' part
        const items = Object.values(tables.templates.items);

        // Use the itemHelper class to assist us in getting only ammo
        // We are filtering all items to only those with a base class of AMMO
        const ammos = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.AMMO));

        // Loop over all the magazines the above code found
        for (const ammo of ammos) {
            // Check the magazine has a weight property before we edit it
            if (ammo._props.Weight) {
                // Set its weight to 0
                ammo._props.Weight = 0;
            }
        }

        // Use the itemHelper class to assist us in getting only currency
        const moneys = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.MONEY));

        // Loop over all the currency the above code found.
        for (const money of moneys) {
            if (money._props.StackMaxSize) {
                money._props.StackMaxSize = 5000000;
            }
        }

        // Use tables
        tables.traders["54cb57776803fa99248b456e"].base.insurance.max_return_hour = 3;
        tables.traders["54cb57776803fa99248b456e"].base.insurance.max_storage_time = 720;
        tables.traders["54cb57776803fa99248b456e"].base.insurance.min_return_hour = 0
        tables.traders["54cb50c76803fa8b248b4571"].base.insurance.max_return_hour = 3;
        tables.traders["54cb50c76803fa8b248b4571"].base.insurance.max_storage_time = 720;
        tables.traders["54cb50c76803fa8b248b4571"].base.insurance.min_return_hour = 0

        // Use config
        insuranceConfig.insuranceMultiplier = {
            "54cb50c76803fa8b248b4571": 0.25,
            "54cb57776803fa99248b456e": 0.75
        }

        insuranceConfig.returnChancePercent = {
            "54cb50c76803fa8b248b4571": 80,
             "54cb57776803fa99248b456e": 100
        }
    }
}

module.exports = { mod: new Bois() }