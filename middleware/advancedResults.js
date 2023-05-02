const ErrorResponse = require("../utils/ErrorResponse");

const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeField = ["select", "sort", "page", "limit"];

  // loop over query and delete from query
  removeField.forEach((param) => delete reqQuery[param]);

  // create query String and create operators ($gt, $lte, $in)
  let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in|eq)\b/g, (match) => `$${match}`);

  // Finding resources
  query = model.find(JSON.parse(queryStr));

  // populate
  if (populate) {
    query = query.populate(populate);
  }

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    // console.log(fields);
    query = query.select(fields);
  }

  // sort the query
  if (req.query.sort) {
    const sortBy = req.query.select.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // pagination
  // 0-based indexing // includes [startIndex, endIndex)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  let total;
  try {
    total = await model.countDocuments(JSON.parse(queryStr));
  } catch (err) {
    return next(new ErrorResponse("Something Wrong happened", 404));
  }
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(page * limit, total);
  query = query.skip(startIndex).limit(limit);

  // Executing query
  let results;
  try {
    results = await query;
  } catch (err) {
    return next(new ErrorResponse("Something wrong happened", 404));
  }

  // console.log(results[0]);
  // console.log(results[0].toJSON());
  // console.log(JSON.stringify(results[0]));

  // pagination result
  const pagination = {
    totalPage: Math.ceil(total / limit),
    pageNo: page,
    limit,
  };

  if (endIndex < total) {
    pagination.next = { page: page + 1 };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1 };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
