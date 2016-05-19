/**
Author : Sunny Chauhan
Module : ProductsController
Created : 19Dec2015
*/
var modelObj = require('./../../../models/products/product.js');
var commonServiceObj = require('./../../../services/Buyer/common.js');
var catModelObj = require('./../../../models/categories/category.js');
var publicCatModelObj = require('./../../../models/virtualcategory/publicCategory.js');
var wishlistObj = require('./../../../models/wishlist/wishlist.js');
var reviewObj = require('./../../../models/reviews/review.js');
var constantObj = require('../../../../config/constants.js');
var async = require('async');
var outputJson;

self = module.exports = {

     /**--------------------------------------------------------------------------
    Function    : availColors
    Params      : null
    Description : view product
    --------------------------------------------------------------------------*/
    createFacetNav: function(req, res) {

        var fObj = JSON.parse(req.query.fObj);
        /** conditions for query **/
        var term = fObj.query;

        if (term == undefined || term == "undefined" || term == "" || term == null) {
            term = '';
        }
        var regexObj = new RegExp(term, 'i');

        /** conditions for category **/
        var catCondn = {};
        if (req.query.categoryIds && req.query.categoryIds != undefined && req.query.categoryIds != "undefined" && req.query.categoryIds != null && req.query.categoryIds != "") {
            //catCondn = {category:{$in:req.query.categoryIds}};
            var ObjectID = require('mongodb').ObjectID;
            categoryId = new ObjectID(req.query.categoryIds); // wrap in ObjectID
            catCondn = {
                category: categoryId
            };
        }

        /** conditions for filters **/
        var variantsArr = [];
        variantsArr.push(catCondn);
        variantsArr.push({
            isDeleted: '0'
        });
        variantsArr.push({
            status: '1'
        });

        var catCondn = {};
        if (fObj.cId && fObj.cId != undefined && fObj.cId != "undefined" && fObj.cId != null && fObj.cId != "") {
            var mongoose = require('mongoose');
            variantsArr.push({
                category: {
                    $in: [mongoose.Types.ObjectId(fObj.cId)]
                }
            });
        }

        var filterCondn = {};
        if (fObj.filters && fObj.filters != undefined && fObj.filters != "undefined" && fObj.filters != "" && fObj.filters != null && Object.keys(fObj.filters).length > 0) {
            parsefilters = JSON.parse(fObj.filters);
            for (var key in parsefilters) {
                var valueArr = commonServiceObj.querytoOriginal(parsefilters[key].toString()).split(",");
                var key = commonServiceObj.querytoOriginal(key);
                var obj = {};
                obj["variants." + key] = {
                    "$in": valueArr
                };
                variantsArr.push(obj);
            }
        }

        conditions = {
            $and: variantsArr,
            $or: [{
                name: {
                    $regex: regexObj
                }
            }, {
                code: {
                    $regex: regexObj
                }
            }, {
                description: {
                    $regex: regexObj
                }
            }, {
                "brandInfo.name": {
                    $regex: regexObj
                }
            }]
        };

        /** Executing the Query **/
        modelObj.aggregate(
                [{
                        "$unwind": "$variants"
                    }, {
                        $unwind: "$variants.filter"
                    }, {
                        "$match": conditions
                    }, {
                        "$project": {
                            "_id": '$_id',
                            filter: '$variants.filter'
                        }
                    },

                    {
                        "$group": {
                            "_id": {
                                "value": "$filter.value",
                                "name": "$filter.name"
                            },
                            "count": {
                                "$sum": 1
                            }
                        }
                    }, {
                        "$group": {
                            "_id": "$_id.name",
                            "data": {
                                "$push": {
                                    "value": "$_id.value",
                                    "count": "$count"
                                }
                            }
                        }
                    }
                ])
            .exec(function(err, resData) {
                if (err) return res.json({
                    resStatus: 'error',
                    msg: 'We are upgrading the system, Please try after some time'
                });
                return res.json(resData);
            })
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Params      : null
    Description : view product
    --------------------------------------------------------------------------*/
    list: function(req, res) {
        var fObj = JSON.parse(req.query.fObj);
        var limitCondn = {
                $limit: parseInt(req.query.limit)
            },
            skipCondn = {
                $skip: parseInt(req.query.offset)
            };

        var conditions = {};
        var variantsArr = [];

        /** conditions for sorting **/
        var sortAttr = fObj.attr;
        var sortCondn = {};
        if (sortAttr == 'lowPrice') {
            sortCondn = {
                "variants.price": 1
            };
        } else if (sortAttr == 'highPrice') {
            sortCondn = {
                "variants.price": -1
            };
        } else if (sortAttr == 'total_reviews') {
            sortCondn = {
                "variants.total_reviews": -1
            };
        } else {
            sortCondn = {
                "variants.total_reviews": -1
            };
        }

        /** conditions for query **/
        var term = fObj.query;
        if (term == undefined || term == "undefined" || term == "" || term == null) {
            term = '';
        }
        var regexObj = new RegExp(term, 'i');

        /** conditions for category only**/
        var catCondn = {};
        if (fObj.cId && fObj.cId != undefined && fObj.cId != "undefined" && fObj.cId != null && fObj.cId != "") {
            var mongoose = require('mongoose');
            variantsArr.push({
                category: {
                    $in: [mongoose.Types.ObjectId(fObj.cId)]
                }
            });
        }

        /** conditions for filters **/
        variantsArr.push(catCondn);
        variantsArr.push({
            isDeleted: '0'
        });
        variantsArr.push({
            status: '1'
        });

        var filterCondn = {};
        if (fObj.filters && fObj.filters != undefined && fObj.filters != "undefined" && fObj.filters != "" && fObj.filters != null && Object.keys(fObj.filters).length > 0) {
            //console.log("filters=", fObj.filters);
            parsefilters = JSON.parse(fObj.filters);
            for (var key in parsefilters) {
                console.log("key", key);
                var valueArr = commonServiceObj.querytoOriginal(parsefilters[key].toString()).split(",");
                var key = commonServiceObj.querytoOriginal(key);
                var obj = {};
                obj["variants." + key] = {
                    "$in": valueArr
                };
                variantsArr.push(obj);
            }
        }

        conditions = {
            $and: variantsArr,
            $or: [{
                name: {
                    $regex: regexObj
                }
            }, {
                code: {
                    $regex: regexObj
                }
            }, {
                description: {
                    $regex: regexObj
                }
            }, {
                "brandInfo.name": {
                    $regex: regexObj
                }
            }]
        };
        console.log(sortCondn);
        modelObj.aggregate([{
            $unwind: "$variants"
        }, {
            $match: conditions
        }, skipCondn, limitCondn, {
            $sort: sortCondn
        }]).exec(function(err, data) {
            if (err) return res.json({
                resStatus: 'error',
                msg: 'We are upgrading the system, Please try after some time'
            });
            return res.json(data);
        });
    },

    /**--------------------------------------------------------------------------
    Function    : view
    Description : view product
    --------------------------------------------------------------------------*/
    view: function(req, res) {
        var dataId = req.query.id;
        modelObj.findOne({
            _id: dataId,
            variants: {
                $elemMatch: {
                    SKU: req.query.sku
                }
            }
        }, {
            'variants.$': 1,
            'name': 1,
            'code': 1,
            'price': 1,
            'brandInfo': 1,
            'weight': 1,
            "description": 1,
            "offers": 1,
            "total_reviews": 1,
            "Quality": 1,
            "Value": 1,
            "Color": 1,
            "rating": 1,
            "price": 1,
            "unit": 1,
            'collectionInfo': 1,
            'styleInfo': 1
        }, function(err, data) {

            if (err) throw err;
            res.json(data);
        });
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    availColors: function(variants, color, res) {
        var conditions = {};
        for (var k in variants) {
            if (variants.hasOwnProperty(k)) {
                conditions["variants." + k] = variants[k];
            }
        }
        if (variants.COLOR) {
            conditions["variants.COLOR"] = {
                $ne: color
            };
        } else if (variants.color) {
            conditions["variants.color"] = {
                $ne: color
            };
        } else {
            conditions["variants.Color"] = {
                $ne: color
            };
        }

        modelObj.aggregate([{
            $project: {
                variants: 1
            }
        }, {
            $unwind: "$variants"
        }, {
            $match: conditions
        }]).exec(function(errs, datas) {
            if (errs) throw errs;
            res.json(datas);
        })
    },

    /**--------------------------------------------------------------------------
    Function    : findVariants
    Description : view product
    --------------------------------------------------------------------------*/
    findVariants: function(req, res) {


        var user = {};
        var dataId = req.query.id;
        modelObj.findOne({
            _id: dataId,
            "variants.SKU": req.query.sku
        }, {
            'variants.$': 1
        }, function(err, data) {

            variants = data.variants[0];
            if (variants.Color) {
                color = variants.Color;
            } else if (variants.COLOR) {
                color = variants.COLOR;
            } else {
                color = variants.color;
            }
            delete variants.SKU;
            delete variants.filter;
            delete variants.attrD;
            delete variants.priceDiffrence;
            delete variants.quantity;
            delete variants.pictures;
            delete variants.Colorrating;
            delete variants.Size;
            delete variants.total_reviews;
            delete variants.Quality;
            delete variants.Value;
            delete variants.rating;
            self.availColors(variants, color, res);
            return false;
            newvariants = variants
            console.log(user);
            return false;
        });
    },


    /**--------------------------------------------------------------------------
    Function    : availColors
    Params      : null
    --------------------------------------------------------------------------*/
    availSizes: function(variants, color, res) {
        var conditions = {};
        for (var k in variants) {
            if (variants.hasOwnProperty(k)) {
                conditions["variants." + k] = variants[k];
            }
        }
        modelObj.aggregate([{
            $project: {
                variants: 1,
                name: 1,
                price: 1,
                code: 1,
                offers: 1
            }
        }, {
            $unwind: "$variants"
        }, {
            $match: conditions
        }]).exec(function(errs, datas) {
            if (errs) throw errs;
            res.json(datas);
        })
    },


    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    fetchSize: function(req, res) {
        var user = {};
        var dataId = req.query.productId;
        modelObj.findOne({
            _id: dataId,
            "variants.SKU": req.query.sku
        }, {
            'variants.$': 1
        }, function(err, data) {
            variants = data.variants[0];
            color = variants.Color;
            delete variants.SKU;
            delete variants.priceDiffrence;
            delete variants.quantity;
            delete variants.pictures;
            delete variants.Size;
            self.availSizes(variants, color, res);
            newvariants = variants
            console.log(user);
            return false;
        });
    },




    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    writeReview: function(req, res) {
        //console.log(req.body);return false
        var outputJSON = "";
        var data = "";
        var errorMessage = "";
        if (req.body) {
            reviewObj(req.body).save(function(err, datas) {

                if (err) {
                    switch (err.name) {
                        case 'ValidationError':

                            for (field in err.errors) {
                                if (errorMessage == "") {
                                    errorMessage = err.errors[field].message;
                                } else {
                                    errorMessage += ", " + err.errors[field].message;
                                }
                            }
                            break;
                    }

                    outputJSON = {
                        'status': 'failure',
                        'messageId': 401,
                        'message': errorMessage
                    };
                    res.jsonp(outputJSON);
                } else {
                    reviewObj.aggregate([{
                        $match: {
                            productId: datas.productId,
                            sku: datas.sku
                        }
                    }, {
                        $group: {
                            _id: '$productId',
                            total_reviews: {
                                $sum: 1
                            },
                            rating: {
                                $avg: '$rating'
                            },
                            count: {
                                $avg: '$rating'
                            },
                            Value: {
                                $avg: '$price'
                            },
                            Quality: {
                                $avg: '$quality'
                            },
                            Color: {
                                $avg: '$color'
                            }
                        }
                    }], function(err, results) {
                        if (err) {
                            console.error(err);
                        } else {
                            var reviewId = datas._id;
                            var product_id = datas.productId;
                            var sku = datas.sku;
                            var avgRating = Math.floor(results[0].rating);
                            var avgColor = Math.floor(results[0].Color);
                            var avgValue = Math.floor(results[0].Value);
                            var avgQuality = Math.floor(results[0].Quality);
                            var reviews = results[0].total_reviews;
                            modelObj.findOneAndUpdate({
                                    "_id": product_id,
                                    "variants.SKU": sku
                                }, {
                                    $push: {
                                        "review": reviewId
                                    },
                                    $set: {
                                        "variants.$.rating": avgRating,
                                        "variants.$.Colorrating": avgColor,
                                        "variants.$.Value": avgValue,
                                        "variants.$.Quality": avgQuality,
                                        "variants.$.total_reviews": reviews
                                    }
                                }, {
                                    "new": true
                                },
                                function(err, data) {
                                    if (err) throw err;
                                    var rest = {};
                                    rest.rating = Math.floor(results[0].rating);
                                    rest.Value = Math.floor(results[0].Value);
                                    rest.Quality = Math.floor(results[0].Quality);
                                    rest.Colorrating = Math.floor(results[0].Color);
                                    rest.total_reviews = Math.floor(results[0].total_reviews);
                                    rest.count = Math.floor(results[0].count);

                                    var test = {};
                                    test.variants = [];
                                    test.variants.push(rest);
                                    rating = [];
                                    rating.push(test);
                                    outputJSON = {
                                        'status': 'success',
                                        'messageId': 200,
                                        'message': constantObj.messages.reviewSuccess,
                                        'data': datas,
                                        'rating': rating
                                    };
                                    res.jsonp(outputJSON);
                                }
                            );
                        }
                    });


                }
            });

        } else {
            outputJSON = {
                'status': 'success',
                'messageId': 200,
                'message': constantObj.messages.reviewSuccessError
            };
            res.jsonp(outputJSON);
        }

    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/

    listReview: function(req, res) {
        var outputJSON = "";
        var data = "";
        var errorMessage = "";
        if (req.params.productId) {
            reviewObj.find({
                productId: req.params.productId,
                sku: req.params.sku
            }).sort({
                created_at: -1
            }).skip(req.params.offset).limit(req.params.limit).exec(function(err, data) {

                if (err) {
                    //code
                } else {
                    outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': "Data Retrived",
                        data: data
                    };
                    res.jsonp(outputJSON);

                }
            });
        }
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    reviews: function(req, res) {
        var outputJSON = "";
        var data = "";
        var errorMessage = "";
        console.log(req.query);
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    fetchItem: function(req, res) {
        if (req.query.sku) {
            modelObj.findOne({
                "_id": req.query.productId,
                "variants.Color": req.query.sku
            }, {
                "variants.$": 1

            }, {
                "name": 1
            }).exec(function(err, data) {

                if (err) {
                    outputJSON = {
                        'status': 'success',
                        'messageId': 403,
                        'message': "Data Retrived"
                    };
                    res.jsonp(outputJSON);
                } else {
                    outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': "Data Retrived",
                        data: data
                    };
                    res.jsonp(outputJSON);

                }
            });

        }
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    wishlist: function(req, res) {
        //console.log(req.body);return false;
        if (req.body.user_id && req.body._id) {
            created = new Date();
            req.body.created = created;
            req.body.updated = created;

            var data = {};
            data.detail = [];

            data.detail.push(req.body);
            data.user_id = req.body.user_id;
            data.productId = req.body._id;
            data.sku = req.body.variants[0].SKU;
            wishlistObj.findOne({
                "is_deleted": false,
                "user_id": req.body.user_id,
                "productId": data.productId,
                "sku": data.sku
            }).exec(function(errs, datas) {
                if (datas) {
                    outputJSON = {
                        'status': 'failure',
                        'messageId': 405,
                        'message': "Item already exist in wishlist"
                    };
                    res.jsonp(outputJSON);
                } else {

                    wishlistObj(data).save(function(err, datas) {
                        if (datas) {
                            outputJSON = {
                                'status': 'success',
                                'messageId': 200,
                                'message': "Item added successfully to the wishlist",
                                data: datas
                            };
                            res.jsonp(outputJSON);
                        } else {
                            console.log(err);
                            outputJSON = {
                                'status': 'failure',
                                'messageId': 403,
                                'message': "Item not added  to the wishlist"
                            };
                            res.jsonp(outputJSON);
                        }
                    });
                }
            })
        } else {
            outputJSON = {
                'status': 'failure',
                'messageId': 403,
                'message': "Please login for adding item ti wishlist"
            };
            res.jsonp(outputJSON);
        }
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Params      : null
    Description : view product
    --------------------------------------------------------------------------*/

    removeWishlist: function(req, res) {

        if (req.query) {
            wishlistObj.update({
                "_id": req.query.Id,
                'user_id': req.query.userId
            }, {
                $set: {
                    is_deleted: true
                }
            }, {
                new: true
            }).exec(function(err, datas) {
                if (datas.nModified == 1) {
                    wishlistObj.find({
                        "user_id": req.query.userId,
                        "is_deleted": false
                    }).exec(function(error, dataRetived) {

                        if (dataRetived) {
                            outputJSON = {
                                'status': 'success',
                                'messageId': 200,
                                'message': "Data Retrived",
                                "data": dataRetived
                            };
                            res.jsonp(outputJSON);
                        } else {
                            outputJSON = {
                                'status': 'failure',
                                'messageId': 403,
                                'message': "Data Not Retrived"
                            };
                            res.jsonp(outputJSON);
                        }
                    });
                }



                ;
            })
        }
    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    fetchWishlist: function(req, res) {
        wishlistObj.find({
            "user_id": req.params.userid,
            "is_deleted": false
        }).exec(function(error, dataRetived) {
            if (dataRetived) {
                outputJSON = {
                    'status': 'success',
                    'messageId': 200,
                    'message': "Data Retrived",
                    "data": dataRetived
                };
                res.jsonp(outputJSON);
            } else {
                outputJSON = {
                    'status': 'failure',
                    'messageId': 403,
                    'message': "Data Not Retrived"
                };
                res.jsonp(outputJSON);
            }
        });
    },


    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    WishListComment: function(req, res) {
        if (req.body) {
            wishlistObj.update({
                "_id": req.body.wishId,
                'user_id': req.body.userId,
                'is_deleted': false
            }, {
                $set: {
                    comment: req.body.comment
                }
            }).exec(function(err, datas) {

                if (datas.ok == 1) {
                    wishlistObj.find({
                        "user_id": req.body.userId,
                        "is_deleted": false
                    }).exec(function(error, dataRetived) {

                        if (dataRetived) {
                            outputJSON = {
                                'status': 'success',
                                'messageId': 200,
                                'message': "Data Retrived",
                                "data": dataRetived
                            };
                            res.jsonp(outputJSON);
                        } else {
                            outputJSON = {
                                'status': 'failure',
                                'messageId': 403,
                                'message': "Data Not Retrived"
                            };
                            res.jsonp(outputJSON);
                        }
                    });
                }



                ;
            })
        }

    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Description : view product
    --------------------------------------------------------------------------*/
    count: function(req, res) {
        var fObj = JSON.parse(req.query.fObj);

        /** conditions for query **/
        var term = fObj.query;
        if (term == undefined || term == "undefined" || term == "" || term == null) {
            term = '';
        }
        var regexObj = new RegExp(term, 'i');
        var variantsArr = [];

        /** conditions for category **/
        var catCondn = {};
        if (fObj.cId && fObj.cId != undefined && fObj.cId != "undefined" && fObj.cId != null && fObj.cId != "") {
            var mongoose = require('mongoose');
            variantsArr.push({
                category: {
                    $in: [mongoose.Types.ObjectId(fObj.cId)]
                }
            });
        }

        variantsArr.push({
            isDeleted: '0'
        });
        variantsArr.push({
            status: '1'
        });


        conditions = {
            $and: variantsArr,
            $or: [{
                name: {
                    $regex: regexObj
                }
            }, {
                code: {
                    $regex: regexObj
                }
            }, {
                description: {
                    $regex: regexObj
                }
            }, {
                "brandInfo.name": {
                    $regex: regexObj
                }
            }]

        };

        modelObj.aggregate([{
            $unwind: "$variants"
        }, {
            $match: conditions
        }, {
            $group: {
                _id: null,
                count: {
                    $sum: 1
                }
            }
        }]).exec(function(err, data) { //console.log(err);
            if (err) return res.json({
                resStatus: 'error',
                msg: 'We are upgrading the system, Please try after some time'
            });

            var countVAl = (data.length != 0) ? data[0].count : 0;
            return res.json(countVAl);
        });


    },

    /**--------------------------------------------------------------------------
    Function    : availColors
    Params      : null
    Description : view product
    --------------------------------------------------------------------------*/
    categoryJson: function(req, res) {
        var async = require('async');
        publicCatModelObj.find({
            is_deleted: 0,
            status: 1,
            parent: null
        }, {
            displayName: 1,
            matchwith: 1,
            matchwithSlug: 1
        }).sort({
            _id: 1
        }).lean().exec(function(err, dataArr) {
            if (err) res.json(err);
            var i = 0;
            var length = dataArr.length;
            var categoryCount = 0;
            async.forEach(dataArr, function(data, callback) {
                publicCatModelObj.find({
                    parent: data._id
                }).lean().exec(function(err, childData, callback) {

                    if (err) throw err;
                    if (childData) {
                        data.childs = childData;
                        dataArr[i] = data;
                        console.log(dataArr[i]);
                        if (dataArr[i].childs.length > 0 && dataArr[i].matchwith != null) {
                            categoryCount = categoryCount + 1;
                        }

                    }

                    i++;
                    if (i == length) {
                        return res.json(dataArr);

                    }

                });
            }, function(err) {
                return res.json(dataArr);
            });
        })
    },


}