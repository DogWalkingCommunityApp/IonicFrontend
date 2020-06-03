import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-strangers-dog-index-card',
  templateUrl: './strangers-dog-index-card.component.html',
  styleUrls: ['./strangers-dog-index-card.component.scss'],
})
export class StrangersDogIndexCardComponent implements OnInit {
  private name: string;
  private age: number;
  private race: string;
  private description: string;
  private descriptionVisible: boolean;
  private male: boolean;
  private female: boolean;
  private genderText: string;
  // neutered = kastriert/sterilisiert
  private neutered: boolean;
  private neuteredText: string;
  constructor() { }

  ngOnInit() {
    this.name = 'Doge';
    this.age = 7;
    this.race = 'Rottweiler';
    this.description = 'Er ist guter junge Er ist guter junge Er ist guter junge Er ist guter junge Er ist guter junge' +
                       ' Er ist guter junge Er ist guter junge Er ist guter junge';
    this.male = false;
    this.female = true;
    this.neutered = false;


    if (this.female) {
      this.genderText = 'Hündin';
      if (this.neutered) {
      this.neuteredText = 'sterilisierte ';
        }
    } else if (this.male) {
        this.genderText = 'Rüde';
        if (this.neutered) {
        this.neuteredText = 'kastrierter ';
      }

      }
  }


  toggleDescription() {
    this.descriptionVisible = !this.descriptionVisible;
  }
}
