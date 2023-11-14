import 'package:flutter/material.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:socket_io_client/socket_io_client.dart';


import 'package:clipsync/home_page.dart';
import 'package:clipsync/components/notification/top_snack_bar.dart';
import 'package:clipsync/components/notification/custom_snack_bar.dart';
import 'package:clipsync/components/session_id_box.dart';

class SessionPage extends StatelessWidget {
  final String sessionID;
  final ClipboardWatcher clipboardWatcher;
  final Socket socket;

  SessionPage({
    Key? key,
    required this.sessionID,
    required this.clipboardWatcher,
    required this.socket,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    socket.on('copied', (_) {
      showTopSnackBar(
        Overlay.of(context),
        CustomSnackBar.info(
          message: "Clip Synced 🔗",
        ),
      );
    });
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
                      Overlay.of(context),
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
                      Overlay.of(context),
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