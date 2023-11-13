import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SessionIDBox extends StatefulWidget {
  final String sessionID;

  SessionIDBox({required this.sessionID});

  @override
  _SessionIDBoxState createState() => _SessionIDBoxState();
}

class _SessionIDBoxState extends State<SessionIDBox>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
      reverseDuration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _opacityAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            padding: EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              border: Border.all(
                color: Colors.green.withOpacity(_opacityAnimation.value),
                width: 2,
              ),
            ),
            child: Text(
              widget.sessionID,
              style: GoogleFonts.spaceMono(
                fontSize: 50,
                color: Colors.white,
                fontWeight: FontWeight.w900,
                letterSpacing: 5,
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
