import child_process from 'child_process';

// daemonize ourselves
export default function daemonize(opt) {
    // we are a daemon, don't daemonize again
    if (process.env.__daemon) {
        return process.pid;
    }

    const args = [].concat(process.argv);

    // shift off node
    args.shift();

    // our script name
    var script = args.shift();

    opt = opt || {};
    const env = opt.env || process.env;

    // the child process will have this set so we can identify it as being daemonized
    env.__daemon = true;

    // start ourselves as a daemon
    module.exports.daemon(script, args, opt);

    // parent is done
    return process.exit();
};

// daemonizes the script and returns the child process object
function ff(script, args, opt) {

    opt = opt || {};

    const stdout = opt.stdout || 'ignore';
    const stderr = opt.stderr || 'ignore';

    const env = opt.env || process.env;
    const cwd = opt.cwd || process.cwd();

    const cp_opt = {
        stdio: ['ignore', stdout, stderr],
        env: env,
        cwd: cwd,
        detached: true
    };

    // spawn the child using the same node process as ours
    const child = child_process.spawn(process.execPath, [script].concat(args), cp_opt);

    // required so the parent can exit
    child.unref();

    return child;
};

