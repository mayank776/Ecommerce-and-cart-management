const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZFF5RA4W",
    secretAccessKey : "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",
    region: "ap-south-1"
});

let uploadFile = async (file) => {
    return new Promise(function(resolve,reject){
        let s3 = new aws.S3({appVersion:"2006-03-01"})

        var uploadParams = {
            ACL : "public-read",
            Bucket : "classroom-training-bucket",
            Key : "g2p5" + file.originalname,
            Body: file.buffer
        };
        console.log(file.originalName)
        console.log(file)

        s3.upload(uploadParams,function(err,data){
            if(err){
                return reject ({error:err});
            }
            console.log(`file upload successfully, ${data.Location}`);
            return resolve(data.Location);
        });
    });
};

module.exports = { uploadFile }