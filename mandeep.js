// get mongo client
const async = require('hbs/lib/async');
const { MongoClient } = require('mongodb'); // client to connect mongoDB

// function to connect DB
async function main(){

    const uri = "mongodb+srv://root:root71162@cluster0.ehkayyu.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri);
    try {
    // connect cluster
        await client.connect(); //await block other operation till client operation
        //await listDatabases(client);// pass mongo client
        // CURD Create function
        // await createListing(client, {
        //     name: "Lovely Loft",
        //     summery: "For A College Student Mandeep Kaur",
        //     bedrooms: 2,
        //     bathroom: 2
        // })
        // await createMultipleListings(client,[
        //     {
        //         name: "Infinite Views",
        //         summery: "Modren Home For A College Student Mandeep Kaur",
        //         property_type: "House",
        //         bedrooms: 2,
        //         bathroom: 2,
        //         beds: 2
        //     },
        //     {
        //         name: "Private Room in CA",
        //         summery: "Apartment For A College Student Mandeep Kaur",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1,
        //         beds: 1
        //     },
        //     {
        //         name: "Beach House",
        //         summery: "Private Beach For A College Student Mandeep Kaur",
        //         property_type: "Apartment",
        //         bedrooms: 4,
        //         bathroom: 2.5,
        //         beds: 7
        //     }
        // ]);
        // ----CURD--Read----one-----------------------
        // await findOneListingByName(client,"Beach House");
        // ----CURD--Read----multiple-----------------------
        // await findOneListingWithMinBedsBathsAndRecentReviews(client,{
        //     minNumOfBeds: 4,
        //     minNumOfBaths: 2,
        //     maxNumOfResults: 5
        // });
        // -----CURD---Update----Single---
        // await updateListingByName(client, "Infinite Views", {bedrooms: 6, beds: 8});
        // -----CURD---Update----Using---Upsert---
        // await upsertListingByName(client, "Cozy Cottage", {bedrooms: 2, bathrooms: 2});
        // -----CURD---Update---Many---
        // await upsertAllListingToHavePropertyType(client);
        // CURD-----Delete--One
        // await deleteListingByName(client, "Cozy Cottage");
        // CURD-----Delete--Many
        await deleteListingScrapedBeforeDate(client, new Date("2019-02-15"));
    }
    catch (e){//catch and send error to console
        console.error(e);
    }
    finally {// to close the connection
        await client.close();
    }
}
// call main function
main().catch(console.error);
// CURD-----Delete--Many
async function deleteListingScrapedBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({
        "last_scraped": {$lt: date}});
    console.log(`${result.deletedCount} documents(s) was/were deleted`);
}
// CURD-----Delete--One
async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({
        name: nameOfListing
    });
    console.log(`${result.deletedCount} documents(s) was/were deleted`);
}
// CURD-----Update----Many--
async function upsertAllListingToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany(
        {property_Type: { $exists: false}},
        {$set: {property_Type: "unkown"}});
        console.log(`${result.matchedCount} document(s) matched the query criteria`);
        console.log(`${result.modifiedCount} documents(s) was/were updated`);
}
// CURD-----Update----Using---Upsert--
async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {name: nameOfListing},
        {$set: updatedListing},
        {upsert: true});
        console.log(`${result.matchedCount} document(s) matched the query criteria`);
        if(result.upsertedCount > 0) {
            console.log(`One documnet was inserted with the id ${result.upsertedId}`);
        }else{
            console.log(`${result.modifiedCount} documents(s) was/were updated`);
        }
    }
    // CURD-----Update----single--
async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {name:nameOfListing},
        {$set: updatedListing});
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} documents was/were updated`);
}
// CURD---Read--Multiple----Data--------
async function findOneListingWithMinBedsBathsAndRecentReviews(client, {
    minNumOfBeds = 0,
    minNumOfBaths = 0,
    maxNumOfResults = Number.MAX_SAFE_INTEGER
}={}){
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms : { $gte: minNumOfBeds},
        bathrooms : { $gte: minNumOfBaths}
    }).sort({ last_review: -1})
    .limit(maxNumOfResults);

    const result = await cursor.toArray();
    // summary of each listing
    if (result.length > 0){
        console.log(`Found listing(s) with at least ${minNumOfBeds} bedrooms and ${minNumOfBaths} bathrooms:`);
        result.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}, name: ${result.name}`);
            console.log(` _id: ${result._id}`);
            console.log(` bedrooms: ${result.bedrooms}`);
            console.log(` bathrooms: ${result.bathrooms}`);
            console.log(` most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    }
    else {
        console.log(`No listing found with at least ${minNumOfBeds} bedrooms and ${minNumOfBaths} bathrooms`);
    }
}
// ---CURD----Read---Single-Record
async function findOneListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});
    if (result) {
        console.log(`Found a listing in the colection with the name '${nameOfListing}'` );
        console.log(result);
    }
    else {
        console.log(`No listing Found with the name '${nameOfListing}'` );
    }
    //------CURD--Create-Multi to create multi list
    async function createMultipleListings(client, newListing){
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListing);
        console.log(`${result.insertedCount} New listing created with the following id (s):`);
        console.log(result.insertedIds);
    }
}


// ---CURD-Create-------create single list-------
async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`)
}
//list database in cluster
async function listDatabases(client){
    const databaseList = await client.db().admin().listDatabases(); //we have now list of databases
    //to print them
    console.log("Databases:");
    databaseList.databases.forEach(db => {
        
        console.log(`- ${db.name}`);
    });
}