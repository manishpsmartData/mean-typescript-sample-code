/**
 * ChatController
 *
 */

module.exports = {
	/*Function to create post new chat with first initilization of socket users*/
	addConv:function (req,res) {
		//getting params of user's request
		var data_from_client = req.params.all();
		if(req.isSocket && req.method === 'POST'){

			// This is the message from connected client
			Chat.create(data_from_client)
				.exec(function(error,result){

                                if(result){
				   //fetching added message to broadcast message to both users, sender & receiver
                                    Chat.findOne({ id: result.id }).populateAll().exec(function(err, data_from_client) {

                                        if(data_from_client){
					    //socket message sending to receiver of message
                                            Chat.message(data_from_client.receiver.id, data_from_client);
				            //socket message sending to sender of message
                                            Chat.message(data_from_client.sender.id, data_from_client);
                                        }
                                    });
                                }

				});
		}
		else if(req.isSocket){
			//stablishing socket for chatting
                        if(data_from_client.params.sender){
                            if(Chat.subscribe(req.socket, data_from_client.params.sender, 'message')){

                            }
                        }
		}
	},
	/*function to get all user messages*/
	getallUsersmsg:function(req,res){

			var data_from_client = req.query;
			Chat.find(
			{

				or: [{ receiver: data_from_client.sender, sender: data_from_client.receiver, jobId: data_from_client.seletedJob},{receiver: data_from_client.receiver, sender: data_from_client.sender, jobId: data_from_client.seletedJob}]

			}).populateAll().exec(function(error,results){

				if(results){
					return res.json(results);
				}else{
					return res.send('invalid');
				}

			});

	},
        /*function to make users read messages - function using by client socket*/
        markAsRead:function (req,res) {
		var params = req.params.all();

                Chat.update({id: params.id},{isRead:true,isNotified:true}).exec(function(err, data) {
                    if(err) {
                        return res.json({status:200,type:"error"});
                    } else {
                        return res.json({status: 200, type:'success'});
                    }
                });
                
        },
	/*function to upload attachment on chat*/
        uploadChatFile:function(req, res) {
            req.file('file').upload({dirname: sails.config.appPath + '/assets/images/chatFile'}, function (err, uploadedFiles) {
                if (err) {
                    return res.negotiate(err.status, {type: 'danger', msg: err});
                } else {
                    if (uploadedFiles[0].fd) {
                        var pathobj = require('path');
                        var fs = require('fs');
                        if (pathobj.basename(uploadedFiles[0].fd)) {
                            var fullphotopath = "images/chatFile/" + pathobj.basename(uploadedFiles[0].fd);
                             var uploadLocation = process.cwd() +'/assets/images/chatFile/' + pathobj.basename(uploadedFiles[0].fd);
                             var tempLocation = process.cwd() + '/.tmp/public/images/chatFile/' +  pathobj.basename(uploadedFiles[0].fd);
                            fs.createReadStream(uploadLocation).pipe(fs.createWriteStream(tempLocation));
                               return res.json(200,{fullFilePath:fullphotopath});    
                        }
                    } 
                }
            });

        }
};

