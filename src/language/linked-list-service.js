const LinkedList = require('../LinkedList');
const LanguageService = require('./language-service')

const LinkedListService = {
  createList(array, head) {
    let List = new LinkedList();
    let indexNext = array[0].id;

    for(let i=0; i < array.length; i++) {
      let word;
      if(i === 0) {
        word = array.filter(item => item.id === head);
        List.insertFirst(word[0]);
        indexNext = word[0].next;
      } else {
        word = array.filter(item => item.id === indexNext);
        List.insertLast(word[0]);
        if(word[0].next) indexNext = word[0].next;
      }
    }
   
    return List;
  },
  updateNext(List) {
    let currNode = List.head;
    while(currNode.next) {
      currNode.value.next = currNode.next.value.id;
      currNode = currNode.next;
    }
    currNode.value.next = null;
    return List;
  },
  moveItem(List, item, memory_value) {
    let index = 0;
    let currNode = List.head;
    while(index !== memory_value) {
      if(currNode) {
        index++;
        currNode = currNode.next;
      } else return List.insertLast(item);
    }

    if(currNode) {
      return List.insertAt(item, memory_value);
    }
  },
  updateDatabaseFromList(List, db) {
    let currNode = List.head;
    while(currNode) {
      LanguageService.updateDbWords(db, currNode.value.id, currNode.value);
      currNode = currNode.next;
    }
    return;
  },
  displayList(List) {
    let currNode = List.head;
    while(currNode) {
      currNode = currNode.next;
    }
  }
};

module.exports = LinkedListService;