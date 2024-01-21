const dataJson = require('../models/dataSchema');

exports.datapost = async (req, res) => {
    try {
        const dataArray = req.body;

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({ error: "Invalid data format." });
        }

        const insertedData = await dataJson.insertMany(dataArray, { ordered: false });

        res.status(200).json(insertedData);
    } catch (error) {
        console.error("Error inserting documents:", error);

        if (error.code === 11000) {
            return res.status(200).json({ message: "Some IDs already exist in the database." });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
};




//   get movies 


exports.getData = async (req, res) => {
    try {
        const maxLimit = 20;
        const { page = 1, limit = 20 } = req.query;
        const limitedLimit = Math.min(parseInt(limit), maxLimit);
        const skip = (page - 1) * limitedLimit;

        // Get total number of documents
        const totalDocs = await dataJson.countDocuments();
        const totalPages = Math.ceil(totalDocs / limitedLimit);

        // Fetch data based on pagination
        const movies = await dataJson.find().skip(skip).limit(limitedLimit).exec();

        res.status(200).json({
            success: 200,
            totalPages,
            results: movies,
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




// advance filter 


exports.advancedatafilter = async (req, res) => {
    const keyword = req.query.keyword || "";
    const letter = req.query.letter || "";
    const genre = req.query.genre || "";
    const country = req.query.country || "";
    const premiered = req.query.premiered || "";
    const year = req.query.year || "";
    const type = req.query.type || "";
    const status = req.query.status || "";
    const rating = req.query.rating || "";
    const language = req.query.language || "";

    const genreArray = Array.isArray(genre) ? genre : [genre];
    const languageArray = Array.isArray(language) ? language : [language];
    const ratingMin = rating.toString();
    const ratingMax = (parseInt(rating) + 1).toString();

    const newMatchLetter = letter.slice(0, 1)
    const cleanedKeyword = keyword.replace(/[\s]+|[^\w\s-]{2,5}/g, "-");

    const query = {
        embed_title: { $regex: `${cleanedKeyword}`, $options: "i" },
        title: { $regex: `^${newMatchLetter}`, $options: "i" },
        genre: { $in: genreArray.map(g => new RegExp(g, 'i')) },
        country: { $regex: country, $options: "i" },
        premiered: { $regex: premiered, $options: "i" },
        date: { $regex: year, $options: "i" },
        type: { $regex: type, $options: "i" },
        status: { $regex: status, $options: "i" },
        rating: { $gte: ratingMin, $lt: ratingMax },
        language: { $in: languageArray.map(g => new RegExp(g, 'i')) },
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 20);
    const skip = (page - 1) * limit;

    try {
        const totalDocs = await dataJson.countDocuments(query);
        const totalPages = Math.ceil(totalDocs / limit);

        const results = await dataJson.find(query).skip(skip).limit(limit);

        res.status(200).json({
            success: 200,
            totalPages,
            results,
        });
    } catch (error) {
        res.status(400).json(error);
        console.log("Error");
    }
};




// get data by id 


exports.getonedata = async (req, res) => {

    const { id } = req.params;

    try {

        const getOneData = await dataJson.findOne({ id: id })

        res.status(200).json({
            success: true,
            getOneData
        })

    } catch (error) {
        res.status(400).json(error);
        console.log("Error");
    }

}


// delete user 


exports.deletedata = async (req, res) => {

    const { id } = req.params;

    try {

        const deletedatabyid = await dataJson.findByIdAndDelete({ _id: id })

        res.status(200).json({
            success: true,
            deletedatabyid
        })

    } catch (error) {
        res.status(400).json(error);
        console.log("Error");
    }

}



// // update data 

exports.updatedata = async (req, res) => {

    const { dataid } = req.params;

    const { id, title, embed_title, sposter, bposter, type, duration, country, episodes, subtitle, dubbed, description, date, genre, status, premiered, language, studios, rating, producers } = req.body;

    try {

        const updatedatabyid = await dataJson.findByIdAndUpdate({ _id: dataid }, {
            id, title, embed_title, sposter, bposter, type, duration, country, episodes, subtitle, dubbed, description, date, genre, status, premiered, language, studios, rating, producers
        }, { new: true })

        await updatedatabyid.save()

        res.status(200).json({
            success: true,
            updatedatabyid
        })

    } catch (error) {
        res.status(400).json(error);
        console.log("Error");
    }

}