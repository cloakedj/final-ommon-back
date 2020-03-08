const User = require('../models/user');
module.exports = {
    addTimelineEvent : (eveId,userId,message,messType,points ) => {
        let timeline = {
            eveId : eveId,
            message : message,
            pointsAwarded : points,
            messageType : messType
        }
        User.findByIdAndUpdate(userId,{
            $addToSet : {timeline: timeline },
          },
              (err,doc) => {
                if (err) throw err;
                doc.pointsObtained += points
                doc.save(); 
                console.log("Timeline Updated");
        });
    }
}

