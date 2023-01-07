const Main = imports.ui.main;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/**
 * 
 * DEBUGGING
 *  - To debug the extension, open a terminal and run the following command:
 *  > journalctl -f -o cat /usr/bin/gnome-shell
 * 
 * 
 * PRE-REQUISITES
 *  1) A script that will be executed when the button is clicked.
 *    - In this example, we'll refer to "my_vpn_connector.sh"
 *      (This script will establish a VPN connection, via the openconnect library.)
 * 
 *  2) Add the "my_vpn_connector.sh" script to the sudoers file.
 *    - Unfortunately, the "my_vpn_connector.sh" script should be executed as a sudo user.
 *      This means that we'll be prompted for a password.
 *      To avoid this, we can add the script to the sudoers file in such a way
 *      that we don't have to enter a password when executing the next command:
 * 
 *      > sudo /home/<username>/my_vpn_connector.sh
 * 
 *      - Steps:
 *         2.1) Open visudo in a terminal:
 *              > sudo visudo
 * 
 *         2.2) Add the following sentence at the end of the file:
 *              > <username> ALL=(ALL) NOPASSWD: /home/<username>/my_vpn_connector.sh
 * 
 *       - Result:
 *         When the user with username: <username> executes the script, (s)he won't be prompted for a password anymore.
 * 
 *  3) Add "/usr/bin/pkill --signal SIGINT openconnect" to the sudoers file.
 *    - As in step 2, we'll be prompted for a password when we want to kill the openconnect process:
 * 
 *      > sudo /usr/bin/pkill --signal SIGINT openconnect
 * 
 *      To avoid this, we can add the next steps into the sudoers file:
 * 
 *      - Steps:
 *         3.1) Create an alias for the pkill command, which will terminate the openconnect process:
 *              > # Cmnd alias specification
 *              > Cmnd_Alias KILL_OPENCONNECT = /usr/bin/pkill --signal SIGINT openconnect
 * 
 *         3.2) Add the following sentence at the bottom of the file:
 *              > <username> ALL=(ALL) NOPASSWD: KILL_OPENCONNECT
 * 
 *      - Result:
 *        When the user with username: <username> executes the command, (s)he won't be prompted for a password anymore.
 * 
 *  4) Save & Restart
 * 
 **/

//
// Path to the script that will establish the VPN connection (my_vpn_connector.sh)
//
let PATH_SSH_SCRIPT = '/home/<username>/my_vpn_connector.sh';


// This is the main object that will be added to the taskbar
let myScriptLauncher;

// content of the object
const ScriptLauncher = GObject.registerClass(
    class ScriptLauncher extends PanelMenu.Button {
        _init() {

            // 0.5 is the position of the menu
            super._init(0.5);

            // Create a icon
            this._icon = new St.Icon({ style_class: 'icon_disconnected' });

            // add the icon to the panel
            this.add_child(this._icon);


            // create a button
            this._connectToVPN = new PopupMenu.PopupSwitchMenuItem('Disconnected from VPN', false, {});

            // add the button to the menu
            this.menu.addMenuItem(this._connectToVPN);

            // add a listener to the button
            // Watching the switch state and updating the switch label
            this._connectToVPN.connect('toggled', this._buttonClicked.bind(this));
        }

        _buttonClicked(item, state) {

            //
            // update the label
            //
            item.label.text = state ? 'Connected to VPN' : 'Disconnected from VPN';
            this._icon.set_style_class_name(state ? 'icon_connected' : 'icon_disconnected');

            //
            // execute the script
            //
            if (state) {

                // run the script
                this._connect();

            } else {

                // kill the process
                this._disconnect();
            }
        }

        _cli(command) {
            // Execute a command line command

            let proc = Gio.Subprocess.new(
                command.trim().split(' '), Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
        }

        _disconnect() {
            // Disconnect from the VPN
            // pkill --signal SIGINT openconnect, has been added to the sudoers file
            // therefore we don't need to prompt the user for a password
            this._cli('sudo pkill --signal SIGINT openconnect');
            log('Disconnected to VPN')
        }

        _connect() {

            // kill any existing process
            this._disconnect();

            // Connect to the VPN
            this._cli('sudo ' + PATH_SSH_SCRIPT);

            log('Connected from VPN')
        }
    }
);


function init() {
}

function enable() {
    myScriptLauncher = new ScriptLauncher();

    // add the menu to the panel (far right => -1)
    Main.panel.addToStatusArea("myScriptLauncher", myScriptLauncher, -1);
}

function disable() {
    myScriptLauncher.destroy();
}
