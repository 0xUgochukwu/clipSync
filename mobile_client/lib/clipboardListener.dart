import 'dart:async';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart';

final TextEditingController sessionIDController = TextEditingController();
Socket socket = io('http://18.170.67.126', <String, dynamic>{
  'autoConnect': false,
  'transports': ['websocket'],
});



final FlutterLocalNotificationsPlugin flutterLocalPlugin =FlutterLocalNotificationsPlugin();
const AndroidNotificationChannel notificationChannel=AndroidNotificationChannel(
    "clipSync",
    "clipSync just started",
    description: "clipSync is waiting to get started",
    importance: Importance.high
);


void main() async{
  WidgetsFlutterBinding.ensureInitialized();
  await initservice();
  runApp(ClipboardListenerApp());
}

Future<void> initservice()async{
  var service=FlutterBackgroundService();
  //set for ios
  if(Platform.isIOS){
    await flutterLocalPlugin.initialize(const InitializationSettings(
        iOS: DarwinInitializationSettings()
    ));
  }

  await flutterLocalPlugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.createNotificationChannel(notificationChannel);

  //service init and start
  await service.configure(
      iosConfiguration: IosConfiguration(
          onBackground: iosBackground,
          onForeground: onStart
      ),
      androidConfiguration: AndroidConfiguration(
          onStart: onStart,
          autoStart: true,
          isForegroundMode: true,
          notificationChannelId: "clipSync",//comment this line if show white screen and app crash
          initialNotificationTitle: "clipSync",
          initialNotificationContent: "clipSync is Running",
          foregroundServiceNotificationId: 90
      )
  );
  service.startService();

  //for ios enable background fetch from add capability inside background mode

}

//onstart method
@pragma("vm:entry-point")
void onStart(ServiceInstance service){
  DartPluginRegistrant.ensureInitialized();

  service.on("setAsForeground").listen((event) {
    print("foreground ===============");
  });

  service.on("setAsBackground").listen((event) {
    print("background ===============");
  });

  service.on("stopService").listen((event) {
    service.stopSelf();
  });

  //display notification as service
  Timer.periodic(Duration(seconds: 5), (timer) {
    flutterLocalPlugin.show(
        90,
        "clipSync",
        "Awsome ${DateTime.now()}",
        NotificationDetails(android:AndroidNotificationDetails("coding is life","coding is life service",ongoing: true,icon: "app_icon")));
  });
  print("Background service ${DateTime.now()}") ;



  final reply = sessionIDController.text;
  socket.emit('join', reply);
  socket.io.options?['query'] = {'sessionID': reply};
  socket.connect();
  clipboardWatcher.start();

  socket.on('sync', (clip) {
    Clipboard.setData(ClipboardData(text: clip));
  });
}

//iosbackground
@pragma("vm:entry-point")
Future<bool> iosBackground(ServiceInstance service)async{
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();

  return true;
}



class ClipboardListenerApp extends StatefulWidget {
  ClipboardListenerApp({Key? key}) : super(key: key);


  @override
  State<ClipboardListenerApp> createState() => _ClipboardListenerAppState();
}

class _ClipboardListenerAppState extends State<ClipboardListenerApp> with ClipboardListener {
  @override
  void initState() {
    clipboardWatcher.addListener(this);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('ClipSync'),
        ),
        body: Center(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  controller: sessionIDController,
                  decoration: InputDecoration(
                    hintText: 'Enter a session number...',
                  ),
                ),
              ),
              ElevatedButton(
                child: const Text('Join Session'),
                onPressed: () {
                  FlutterBackgroundService().startService();
                  // Implement the logic to join the session with the provided number.
                },
              ),
            ],
          ),
        ),
      ),
    );
  }


  @override
  void onClipboardChanged() async {
    ClipboardData? clipData =
    await Clipboard.getData(Clipboard.kTextPlain);
    socket.emit('copy', clipData?.text);
    print(clipData?.text);
  }


  void sendClip() async {

  }
}