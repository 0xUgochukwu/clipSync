import 'package:flutter/material.dart';


import 'package:google_fonts/google_fonts.dart';
import 'package:clipboard_watcher/clipboard_watcher.dart';
import 'package:socket_io_client/socket_io_client.dart';


import 'package:clipsync/session_page.dart';
import 'package:clipsync/components/notification/top_snack_bar.dart';
import 'package:clipsync/components/notification/custom_snack_bar.dart';





class HomePage extends StatelessWidget {
  final ClipboardWatcher clipboardWatcher;
  final Socket socket;
  final TextEditingController sessionIDController = TextEditingController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final sessionIDRegex = RegExp(r'^[A-Z0-9]{6}$');

  HomePage({
    Key? key,
    required this.clipboardWatcher,
    required this.socket,
  }) : super(key: key);



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      body: Center(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Image(
                image: AssetImage('assets/images/white_logo.png'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 5,
                  shadowColor: const Color(0xFFEEEDED),

                ),
                child: Text(
                    'Start Session',
                    style: GoogleFonts.spaceMono(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                )
                ),
                onPressed: () {
                  _handleErrors(context);
                  socket.io.options?['query'] = {'starting': true};
                  socket.on('started', (sessionID) {
                    _handleEvents(context);
                    clipboardWatcher.start();
                    showTopSnackBar(
                      Overlay.of(context),
                      CustomSnackBar.success(
                        message: "Session $sessionID Started",
                      ),
                    );
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => SessionPage(
                          sessionID: sessionID,
                          clipboardWatcher: clipboardWatcher,
                          socket: socket,
                        ),
                      ),
                    );
                  });
                  socket.on('connect', (_) {
                    socket.emit('start');
                  });
                  socket.connect();
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 5,
                  shadowColor: const Color(0xFFEEEDED),

                ),
                child: Text(
                    'Join Session',
                    style: GoogleFonts.spaceMono(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    )
                ),
                onPressed: () {
                  showDialog(
                    context: _scaffoldKey.currentContext!,
                    builder: (BuildContext context) => AlertDialog(
                      title: const Text('Enter Session ID'),
                      content: TextField(
                        controller: sessionIDController,
                        decoration: const InputDecoration(
                          hintText: 'Enter Session ID',
                        ),
                      ),
                      actions: [
                        TextButton(
                          style: TextButton.styleFrom(
                            primary: Colors.amber,
                          ),
                          onPressed: () {
                            Navigator.pop(context, 'Cancel');
                          },
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          style: TextButton.styleFrom(
                            primary: Colors.black,
                          ),
                          onPressed: () {
                            _handleErrors(context);
                            print(sessionIDController.text);
                            if (!sessionIDRegex.hasMatch(sessionIDController.text)) {
                              showTopSnackBar(
                                Overlay.of(_scaffoldKey.currentContext!),
                                const CustomSnackBar.error(
                                  message: "Invalid Session ID",
                                ),
                              );
                              return;
                            }
                            socket.io.options?['query'] = {
                              'sessionID': sessionIDController.text
                            };
                            socket.on('joined', (sessionID) {
                              clipboardWatcher.start();
                              _handleEvents(context);
                              Navigator.of(context).pop();
                              showTopSnackBar(
                                Overlay.of(_scaffoldKey.currentContext!),
                                CustomSnackBar.success(
                                  message: "Synced! Happy Clipping!",
                                ),
                              );
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => SessionPage(
                                    sessionID: sessionID,
                                    clipboardWatcher: clipboardWatcher,
                                    socket: socket,
                                  ),
                                ),
                              );
                            });
                            socket.on('connect', (_) {
                              socket.emit('join');
                            });
                            socket.connect();
                          },
                          child: const Text('OK'),
                        ),
                      ],
                    ),

                  );
                },
              ),
            ),

          ],
        ),
      ),
    );
  }


  void _handleEvents(BuildContext context) {
    socket.on('copied', (_) {
      showTopSnackBar(
        Overlay.of(context),
        CustomSnackBar.success(
          message: "Clipped!",
        ),
      );
    });
    socket.on('close', (_) {
      socket.on('disconnect', (_) {
        showTopSnackBar(
          Overlay.of(_scaffoldKey.currentContext!),
          CustomSnackBar.info(
            message: "Your Session Ended!",
          ),
        );
        Navigator.push(
          _scaffoldKey.currentContext!,
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
    });
  }

  void _handleErrors(BuildContext context) {
    socket.on('connect_error', (error) {
      showTopSnackBar(
        Overlay.of(context),
        const CustomSnackBar.error(
          message:
          "Error Connecting to ClipSync, Retrying...",
        ),
      );
    });

    socket.on('connect_failed', (error) {
      showTopSnackBar(
        Overlay.of(context),
        const CustomSnackBar.error(
          message:
          "Error Connecting to ClipSync, Retrying...",
        ),
      );
    });
  }
}