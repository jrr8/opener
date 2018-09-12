/*
This sample is code I wrote for Muvve. It takes advantage of google's Firebase
platform to do various tasks when events happen in the database. For example,
when a new message is written into the database for a chat thread, the recipient
of the message is sent a push notification
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const LIVEMODE = true;

let serviceAccount;
let storageBucket;
let databaseURL;


if (LIVEMODE) {
    serviceAccount = require('./service_account_credentials_live.json');
    storageBucket = "muvvefinal.appspot.com";
    databaseURL = "https://muvvefinal.firebaseio.com"
} else {
    serviceAccount = require('./service_account_credentials_test.json');
    storageBucket = "muvvetest.appspot.com";
    databaseURL = "https://muvvetest.firebaseio.com"
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket,
    databaseURL: databaseURL
});

const db = admin.database();
const bucket = admin.storage().bucket();


// full payload options are detailed at:
// https://firebase.google.com/docs/reference/admin/node/admin.messaging.NotificationMessagePayload

// full options options are detailed at:
// https://firebase.google.com/docs/reference/admin/node/admin.messaging.MessagingOptions

exports.messagingNotification = functions.database.ref('/messages/{chatId}/{msgId}').onCreate((creationEvent, context) => {
    const msgData = creationEvent.val();
    const senderId = msgData.sender;
    const msgText = msgData.message;
    function sendNotification(recipientId) {
        const fcmTokenPromise = db.ref('/users/' + recipientId + "/fcm_token").once('value');
        const badgeCountPromise = getUnreadMessagesCount(recipientId);
        const senderNameDataPromise = db.ref('/users/' + senderId + '/name').once('value');
        return Promise.all([fcmTokenPromise, badgeCountPromise, senderNameDataPromise]).then(([tokenData, badgeCount, senderNameData]) => {
            const token = tokenData.val();
            let senderName = senderNameData.val();
            if (senderName === null ) { senderName = "New Message" }
            const payload = {
                notification: {
                    body: msgText,
                    title: senderName,
                    sound: "receive-sound.mp3",
                    badge: badgeCount.toString()
                }
            };
            const options = { contentAvailable: true };
            return admin.messaging().sendToDevice(token, payload, options)
        })
    }
    return db.ref('/chats/' + context.params.chatId + '/members').once('value').then(chatSnapshot => {
        let chatMemberIds = new Set(Object.keys(chatSnapshot.val()));
        chatMemberIds.delete(senderId);
        return Promise.all(Array.from(chatMemberIds).map(sendNotification))
    })
});


exports.updateUserPhotos = functions.database.ref("/users/{userId}/prof_photos/{idx}").onWrite((change, context) => {
    const userId = context.params.userId;
    const photoIdx = context.params.idx;

    if (getEventType(change) === "delete") {
        return bucket.file(`users/${userId}/${photoIdx}`).delete().catch(() => {
            console.log('error deleting ' + photoIdx + ' for user: ' + userId)
        })
    }

    const eventData = change.after.val();
    function uploadToStorage(icon=false) {
        const options = {
            destination: `users/${userId}/${photoIdx + (icon ? "_thumb" : "")}`,
            metadata: {
                contentType: "image/jpeg"
            }
        };
        return bucket.upload(eventData[icon ? "icon_url" : "full_size_url"], options, (err, file) => {
            if (err) { return console.log('error in photo upload: ' + err) }
            const config = {
                action: "read",
                expires: "12-31-2118"
            };
            return file.getSignedUrl(config, (err, url) => {
                if (err) { return console.log('error getting url: ' + err) }
                return db.ref(`/users/${userId}/prof_photos/${photoIdx}/${icon ? "icon_url" : "full_size_url"}`).set(url)
            })
        })
    }
    if (eventData.hasOwnProperty("full_size_url")) {
        if (eventData["full_size_url"].includes("https://firebasestorage")) {
            return null
        }
        uploadToStorage(false)
    }
    if (eventData.hasOwnProperty("icon_url")) { uploadToStorage(true) }
    return null
});


exports.updatePastConnectionsCount = functions.database.ref('/users/{userId}/connections/{newConnectionId}').onWrite((change, context) => {
    if (getEventType(change) === "delete") { return null }
    const userId = context.params.userId;
    const newConnectionId = context.params.newConnectionId;
    return db.ref('/users/' + userId + '/past_connections/' + newConnectionId).once('value').then(pastValueSnapshot => {
        let pastValue = pastValueSnapshot.val();
        if (pastValue === null) { pastValue = 0 }
        let updates = {};
        updates['/' + newConnectionId] = pastValue + 1;
        return pastValueSnapshot.ref.parent.update(updates)
    })
});


exports.notifyAdminsOfNewUser = functions.database.ref('/users/{userId}').onCreate((event, context) => {
    const rileyId = '1968689306490208';
    const aviId = '10159159515835243';
    const julianId = '10155660357658142';
    const danId = '1503606033035859';

    const ids = [rileyId, aviId, julianId, danId];
    const tokenPromises = ids.map(id => db.ref('/users/' + id + '/fcm_token').once('value'));

    return Promise.all(tokenPromises).then(tokenResults => {
        const tokens = tokenResults.map(x => x.val());
        const countRef = db.ref('/counts/users');
        return db.ref(countRef).once('value').then(countResult => {
            const newCount = countResult.val() + 1;
            const payload = {
                notification: {
                    body: 'We now have ' + newCount + ' users. Way to go team',
                    title: 'We got a new user!',
                }
            };
            const options = { contentAvailable: true };
            return admin.messaging().sendToDevice(tokens, payload, options).then(_ => {
                return db.ref(countRef).set(newCount).then( _ => { return } )
            })
        });
    })
});



//-----------------
// Helper Functions
//-----------------

function getEventType(event) {
    if (!event.after.exists()) { return "delete" }
    else if (event.before.exists()) { return "update" }
    else { return "write" }
}

function getUnreadMessagesCount(userId) {
    const recipientChatDataPromise = db.ref('/users/' + userId + "/chats").once('value');
    const chatsLastSentMsgPromise = recipientChatDataPromise.then(chatsSnapshot => {
        const chatIds = Object.keys(chatsSnapshot.val());
        const lastMsgPromises = chatIds.map(chatId => {
            return db.ref('/messages/' + chatId).orderByKey().limitToLast(1).once('value')
        });
        return Promise.all([chatIds].concat(lastMsgPromises)).then(results => {
            const chatIds = results.shift();
            const lastMsgs = results;

            let chatsLastSentMsg = {};
            for (let i = 0; i < chatIds.length; i++) {
                const chatId = chatIds[i];
                const lastMsgId = Object.keys(lastMsgs[i].val())[0];
                chatsLastSentMsg[chatId] = lastMsgId
            }
            return chatsLastSentMsg
        })
    });
    return Promise.all([recipientChatDataPromise, chatsLastSentMsgPromise]).then(([recipientChatData, chatsLastSentMsgData]) => {
            const recipientChats = recipientChatData.val();
            const chatsLastSentMsgs = chatsLastSentMsgData;
            let badgeCount = 0;
            for (const prop in recipientChats) {
                badgeCount += (recipientChats[prop] !== chatsLastSentMsgs[prop] ? 1 : 0)
            }
            return badgeCount
    })
}
