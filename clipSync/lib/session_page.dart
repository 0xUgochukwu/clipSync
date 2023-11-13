import 'package:flutter/material.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:socket_io_client/socket_io_client.dart';


import 'package:clipsync/home_page.dart';
import 'package:clipsync/notification/top_snack_bar.dart';
import 'package:clipsync/notification/custom_snack_bar.dart';



class SessionIDBox extends StatelessWidget {
  final String sessionID;

  SessionIDBox({required this.sessionID});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(8.0),

      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: Colors.green,
          width: 2,
        ),
      ),
      child: Text(
        sessionID,
        style: GoogleFonts.spaceMono(
          fontSize: 50,
          color: Colors.white,
          fontWeight: FontWeight.w900,
          letterSpacing: 5,

        )
      ),
    );
  }
}

class SessionPage extends StatelessWidget {
  final String sessionID;
  final ClipboardWatcher clipboardWatcher;
  final Socket socket;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  SessionPage({
    Key? key,
    required this.sessionID,
    required this.clipboardWatcher,
    required this.socket,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            Padding(
              // pad the top
              padding: const EdgeInsets.only(top: 100.0, bottom: 16.0),
              child: SessionIDBox(sessionID: sessionID),
            ),
            // input text field
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Enter text...',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  primary: Colors.amber,
                  minimumSize: const Size(300, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 5,
                  shadowColor: const Color(0xFFEEEDED),

                ),
                child: Text(
                    'Leave Session',
                    style: GoogleFonts.spaceMono(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    )
                ),
                onPressed: () {
                  socket.emit('leave');
                  clipboardWatcher.stop();
                  socket.on('disconnect', (_) {
                    showTopSnackBar(
                      Overlay.of(_scaffoldKey.currentContext!),
                      CustomSnackBar.info(
                        message: "Byeeeeee!",
                      ),
                    );
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => HomePage(
                          key: key,
                          clipboardWatcher: clipboardWatcher,
                          socket: socket,
                        ),
                      ),
                    );
                  });
                  socket.disconnect();
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  primary: const Color(0xFFC70039),
                  minimumSize: const Size(300, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 5,
                  shadowColor: Colors.white.withOpacity(0.3),

                ),
                child: Text(
                    'End Session',
                    style: GoogleFonts.spaceMono(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    )
                ),
                onPressed: () {
                  socket.emit('end');
                  clipboardWatcher.stop();
                  socket.on('disconnect', (_) {
                    showTopSnackBar(
                      Overlay.of(_scaffoldKey.currentContext!),
                      CustomSnackBar.info(
                        message: "Welp, that's the end of that!",
                      ),
                    );
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => HomePage(
                          key: key,
                          clipboardWatcher: clipboardWatcher,
                          socket: socket,
                        ),
                      ),
                    );
                  });
                  socket.disconnect();
                },
              ),
            ),

          ],
        ),
      ),
    );
  }


}