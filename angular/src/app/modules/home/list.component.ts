import { Input, Component } from '@angular/core';


import { DisplayGroup } from '../../shared/models';

import { DbService, UserService, UserConfig, GmailService } from '../../shared';


import { MdcSnackbar } from '@angular-mdc/web';

@Component({
    selector: 'grouped-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
// tslint:disable:variable-name
export class ListComponent {
    @Input() groups: DisplayGroup[];
    @Input() status: number;


    loading:boolean = false;
    statusText:string = 'Loading...';


    
    constructor(private _dbService:DbService, private snackbar: MdcSnackbar, private _gmailService:GmailService) { }

    
    async keep(id) {
        await this._dbService.keep(id);
    }

    async delete(id) {
        await this._dbService.delete(id);
        await this._gmailService.delete(id);
    }

    async unsubscribe(id) {
        var msg = await this._dbService.exists(id);

        if(msg.unsubscribeEmail !== undefined) {
            var result = await this._gmailService.send(msg.unsubscribeEmail);
            await this._dbService.unsubscribe(id);
            await this._gmailService.delete(result.id);

            this.snackbar.open('Unsubscription email sent to: ' + msg.unsubscribeEmail + ' and moved to trash.');
        } else {
            await this._gmailService.unsubscribeUrl(msg.unsubscribeUrl);
            await this._dbService.unsubscribe(id);

            this.snackbar.open('Unsubscription requested.');
        }
    }



    async keepAll(hostname,mg, event) {

        mg.keepLoading = true;
        mg.statusText = "Loading...";

        event.stopPropagation(); 
        await this._dbService.keepAll(hostname);

        mg.keepLoading = false;;

        //this.groups[dgIndex].messagegroups.splice( mgIndex, 1 );
        /*
        if(this.groups[dgIndex].messagegroups.length == 0) {
            delete this.groups[dgIndex];
        }
        */
    }

    async deleteAll(hostname,mg, event) {

        mg.deleteLoading = true;

        mg.statusText = "Loading...";

        event.stopPropagation(); 
        var allMessagesToDelete = await this._dbService.filterEqualsIgnoreCase("hostname",hostname).toArray();
        for(var i = 0; i < allMessagesToDelete.length;i++) {
            mg.statusText = 'Delete ' + i + ' of ' + allMessagesToDelete.length;
            await this._gmailService.delete(allMessagesToDelete[i].id);
        }

        await this._dbService.deleteAll(hostname);

        mg.deleteLoading = false;
    }

    async unsubscribeAll(hostname,mg, event) {
        mg.unsubLoading = true;
        mg.statusText = "Loading...";

        event.stopPropagation(); 
        await this._dbService.unsubscribeAll(hostname);

        mg.unsubLoading = false;
    }
}



