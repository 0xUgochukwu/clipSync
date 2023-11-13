import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';


import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_background/flutter_background.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:socket_io_client/socket_io_client.dart';


import 'package:clipsync/home_page.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  print(await FlutterBackground.initialize());
  print(await FlutterBackground.enableBackgroundExecution());
  runApp(const ClipSync());
}

Map<int, Color> color =
{
  50:Color.fromRGBO(255,255,255, .1),
  100:Color.fromRGBO(255,255,255, .2),
  200:Color.fromRGBO(255,255,255, .3),
  300:Color.fromRGBO(255,255,255, .4),
  400:Color.fromRGBO(255,255,255, .5),
  500:Color.fromRGBO(255,255,255, .6),
  600:Color.fromRGBO(255,255,255, .7),
  700:Color.fromRGBO(255,255,255, .8),
  800:Color.fromRGBO(255,255,255, .9),
  900:Color.fromRGBO(255,255,255, 1),
};
Socket socket = io('ws://18.170.67.126:4500', <String, dynamic>{
  'autoConnect': false,
  'transports': ['websocket'],
});



class ClipSync extends StatefulWidget {
  const ClipSync({Key? key}) : super(key: key);

  @override
  State<ClipSync> createState() => _ClipSyncState();
}

class _ClipSyncState extends State<ClipSync> with ClipboardListener {
  @override
  void initState() {
    clipboardWatcher.addListener(this);

    socket.on('sync', (clip) {
      Clipboard.setData(ClipboardData(text: clip));
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClipSync',
      theme: ThemeData(
        fontFamily: GoogleFonts.spaceMono().fontFamily,
        scaffoldBackgroundColor: const Color(0xFF000000),
        primaryColor: const Color(0xFF000000),
        primarySwatch: MaterialColor(0xFFFFFFFF, color),
      ),
      home: HomePage(clipboardWatcher: clipboardWatcher, socket: socket),
    );
  }

  @override
  void onClipboardChanged() async {
    ClipboardData? clip =
    await Clipboard.getData(Clipboard.kTextPlain);
    print(clip?.text);
    socket.emit('copy', clip?.text);
  }
}