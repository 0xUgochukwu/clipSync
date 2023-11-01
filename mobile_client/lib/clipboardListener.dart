import 'dart:io';
import 'dart:isolate';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;


// @pragma('vm:entry-point')
// void startCallback() {
//   // The setTaskHandler function must be called to handle the task in the background.
//   FlutterForegroundTask.setTaskHandler(clipboardListenerTaskHandler());
// }
//
// class clipboardListenerTaskHandler extends TaskHandler {
//   SendPort? _sendPort;
//   int _eventCount = 0;
//
//   // Called when the task is started.
//   @override
//   void onStart(DateTime timestamp, SendPort? sendPort) async {
//
//   }
//
//   // Called every [interval] milliseconds in [ForegroundTaskOptions].
//   @override
//   void onRepeatEvent(DateTime timestamp, SendPort? sendPort) async {
//     FlutterForegroundTask.updateService(
//       notificationTitle: 'MyTaskHandler',
//       notificationText: 'eventCount: $_eventCount',
//     );
//
//     // Send data to the main isolate.
//     sendPort?.send(_eventCount);
//
//     _eventCount++;
//   }
//
//   // Called when the notification button on the Android platform is pressed.
//   @override
//   void onDestroy(DateTime timestamp, SendPort? sendPort) async {
//     print('onDestroy');
//   }
//
//   // Called when the notification button on the Android platform is pressed.
//   @override
//   void onNotificationButtonPressed(String id) {
//     print('onNotificationButtonPressed >> $id');
//   }
//
//   // Called when the notification itself on the Android platform is pressed.
//   //
//   // "android.permission.SYSTEM_ALERT_WINDOW" permission must be granted for
//   // this function to be called.
//   @override
//   void onNotificationPressed() {
//     // Note that the app will only route to "/resume-route" when it is exited so
//     // it will usually be necessary to send a message through the send port to
//     // signal it to restore state when the app is already started.
//     FlutterForegroundTask.launchApp("/resume-route");
//     _sendPort?.send('onNotificationPressed');
//   }
// }
//
// void _initForegroundTask() {
//   FlutterForegroundTask.init(
//     androidNotificationOptions: AndroidNotificationOptions(
//       channelId: 'foreground_service',
//       channelName: 'Foreground Service Notification',
//       channelDescription: 'This notification appears when the foreground service is running.',
//       channelImportance: NotificationChannelImportance.LOW,
//       priority: NotificationPriority.LOW,
//       iconData: const NotificationIconData(
//         resType: ResourceType.mipmap,
//         resPrefix: ResourcePrefix.ic,
//         name: 'launcher',
//       ),
//       buttons: [
//         const NotificationButton(id: 'sendButton', text: 'Send'),
//         const NotificationButton(id: 'testButton', text: 'Test'),
//       ],
//     ),
//     iosNotificationOptions: const IOSNotificationOptions(
//       showNotification: true,
//       playSound: false,
//     ),
//     foregroundTaskOptions: const ForegroundTaskOptions(
//       interval: 5000,
//       isOnceEvent: false,
//       autoRunOnBoot: true,
//       allowWakeLock: true,
//       allowWifiLock: true,
//     ),
//   );
// }


class ClipboardListenerApp extends StatefulWidget {
  ClipboardListenerApp({Key? key}) : super(key: key);
  final TextEditingController sessionIDController = TextEditingController();
  var sessionID;
  IO.Socket socket = IO.io('http://18.170.67.126');


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
                  controller: widget.sessionIDController,
                  decoration: InputDecoration(
                    hintText: 'Enter a session number...',
                  ),
                ),
              ),
              ElevatedButton(
                child: const Text('Join Session'),
                onPressed: () {
                  final reply = widget.sessionIDController.text;
                  widget.socket.emit('join', reply);
                  widget.sessionID = reply;

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
    ClipboardData? newClip =
    await Clipboard.getData(Clipboard.kTextPlain);
    widget.socket.sessionID = '54333';
    widget.socket.emit('copy', widget.sessionID, newClip?.text);
    print(newClip?.text);
  }


  void sendClip() async {

  }
}