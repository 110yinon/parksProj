import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

const PUSH_ENDPOINT = 'https://your-server.com/users/push-token';

export default async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    console.log(" ***** finalStatus *****",finalStatus);
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
        console.log("existingStatus !== 'granted'");
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
        console.log("finalStatus !== 'granted'");
        return;
    }
    console.log("before getExpoPushTokenAsync");
    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    console.log("token: ",token);
    // POST the token to your backend server from where you can retrieve it to send push notifications.
    return(token);
    // return fetch(PUSH_ENDPOINT, {
    //     method: 'POST',
    //     headers: {
    //         Accept: 'application/json',
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         token: {
    //             value: token,
    //         },
    //         user: {
    //             username: 'Brent',
    //         },
    //     }),
    // });
}