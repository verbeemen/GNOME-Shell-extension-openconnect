import St from 'gi://St';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let PATH_SSH_SCRIPT = '/home/<username>/my_vpn_connector.sh';


export default class ScriptLauncher extends Extension {
    enable(){
        // Create the panel button
        this._button = new PanelMenu.Button(0.5, this.metadata.name, false);
        
        // Create a icon
        this._button_icon = new St.Icon({style_class: 'icon_disconnected'});
        this._button.add_child(this._button_icon);


        // Create a button
        this._connectToVPN = new PopupMenu.PopupSwitchMenuItem('Disconnected from VPN', false, {});

        // Add the button to the menu
        this._button.menu.addMenuItem(this._connectToVPN);
        
        // Add the button to the panel
        Main.panel.addToStatusArea(this.metadata.uuid, this._button);

        // Add a listener to the button
        // Watching the switch state and updating the switch label
        this._connectToVPN.connect('toggled', this._buttonClicked.bind(this));
    }

    disable(){
        // Remove the indicator from the panel
        this._button.destroy();
        this._button = null;

        console.error('this is our error');
        console.trace();
    }


    _buttonClicked(item, state){
        // Update the label
        item.label.text = state ? 'Connected to VPN' : 'Disconnected from VPN';
        // Execute the script
        if (state) {
            // Run the script
            this._connect();
        } else {
            // Kill the process
            this._disconnect();
        }
    }

    _cli(command) {
        // Execute the command, in the termonal
        let proc = Gio.Subprocess.new(
            command.trim().split(' '), 
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
        );

        // Example of handling stdout and stderr
        proc.communicate_utf8_async(null, null, (proc, res) => {
            try {
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                if (stdout) { log("Command output: " + stdout); }
                if (stderr) { logError("Command error: " + stderr); }
            } catch (e) {
                logError("Error during command execution: " + e);
            }
        });
    }

    _disconnect() {
            // Disconnect from the VPN
            this._cli('sudo pkill --signal SIGINT openconnect');
            this._button_icon.set_style_class_name('icon_disconnected');
            log('Disconnected from VPN');
    }

    _connect() {
        // Kill any existing process
        this._disconnect();

        // Connect to the VPN
        this._cli('sudo ' + PATH_SSH_SCRIPT);
        this._button_icon.set_style_class_name('icon_connected');
        log('Connected to VPN');
    }
}
