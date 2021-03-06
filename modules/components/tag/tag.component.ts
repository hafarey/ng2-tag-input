import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    ElementRef,
    Renderer,
    HostListener,
    ViewChild
} from '@angular/core';

import { TagModel } from '../helpers/accessor';
import { TagRipple } from './tag-ripple.component';

@Component({
    selector: 'tag',
    templateUrl: './tag.template.html',
    styleUrls: [ './tag-component.style.scss' ]
})
export class TagComponent {
    /**
     * @name model {TagModel}
     */
    @Input() public model: TagModel;

    /**
     * @name readonly
     */
    @Input() public readonly: boolean;

    /**
     * @name removable
     */
    @Input() public removable: boolean;

    /**
     * @name editable
     */
    @Input() public editable: boolean;

    /**
     * @name template
     */
    @Input() public template: TemplateRef<any>;

    /**
     * @name onSelect
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onSelect: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onRemove
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onRemove: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onBlur
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onBlur: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onKeyDown
     * @type {EventEmitter<any>}
     */
    @Output() public onKeyDown: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @name onTagEdited
     * @type {EventEmitter<any>}
     */
    @Output() public onTagEdited: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name editModeActivated
     * @type {boolean}
     */
    private editModeActivated: boolean = false;

    /**
     * @name rippleState
     * @type {string}
     */
    private rippleState: string = 'none';

    /**
     * @name ripple
     */
    @ViewChild(TagRipple) public ripple: TagRipple;

    constructor(public element: ElementRef,
                public renderer: Renderer) {}

    /**
     * @name select
     */
    public select($event?: MouseEvent): void {
        if (this.readonly) {
            return;
        }

        if ($event) {
            $event.stopPropagation();
        }

        this.focus();

        this.onSelect.emit(this.model);
    }

    /**
     * @name remove
     */
    public remove(): void {
        this.onRemove.emit(this.model);
    }

    /**
     * @name focus
     */
    public focus(): void {
        this.renderer.invokeElementMethod(this.element.nativeElement, 'focus');
    }

    /**
     * @name keydown
     * @param event
     */
    @HostListener('keydown', ['$event'])
    public keydown(event: KeyboardEvent): void {
        if (this.editModeActivated) {
            event.keyCode === 13 ? this.disableEditMode(event) : this.storeNewValue();
            return;
        }

        this.onKeyDown.emit({event, model: this.model});
    }

    /**
     * @name blink
     */
    public blink(): void {
        const classList = this.element.nativeElement.classList;
        classList.add('blink');
        setTimeout(() => classList.remove('blink'), 50);
    }

    /**
     * @name toggleEditMode
     */
    public toggleEditMode($event?): void {
        $event.stopPropagation();
        $event.preventDefault();

        if (this.editModeActivated) {
            this.storeNewValue();
        }

        this.editModeActivated = !this.editModeActivated;
    }

    /**
     * @name getContentEditableText
     * @returns {string}
     */
    private getContentEditableText(): string {
        return this.element.nativeElement.querySelector('[contenteditable]').innerText.trim();
    }

    /**
     * @name disableEditMode
     * @param $event
     */
    private disableEditMode($event: KeyboardEvent): void {
        this.editModeActivated = false;
        $event.preventDefault();
    }

    /**
     * @name storeNewValue
     */
    private storeNewValue(): void {
        const input = this.getContentEditableText();

        // if the value changed, replace the value in the model
        if (input !== this.model.display) {
            this.model.display = input;

            // emit output
            this.onTagEdited.emit(this.model);
        }
    }
}
