import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

const allowsNotificationsAsync = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

const requestPermissionsAsync = async () => {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
};

export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus !== "granted") {
        const { status } = Notifications.requestPermissionsAsync();
        let finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push Notifications need permission"
        );
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }
    configurePushNotifications();
  }, []);
  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification);
      }
    );
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const notificationHandler = async () => {
    if (Device.osName === "iOS") {
      const hasPushNotificationPermissionGranted =
        await allowsNotificationsAsync();

      if (!hasPushNotificationPermissionGranted) {
        await requestPermissionsAsync();
      }
    }
    Notifications.scheduleNotificationAsync({
      content: {
        title: "First Local Notification",
        body: "This is body section",
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  function sendPushNotificationHandler() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[IhzNFNG1zW3IHCOvSwCOXj]",
        title: "Testing Push Notification",
        body: "This is a body",
      }),
    });
  }
  return (
    <View style={styles.container}>
      <Button title="Send Notification" onPress={sendPushNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
