import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfileEditDialogComponent } from './profile-edit-dialog.component'
import { ProfileService } from 'src/app/services/profile.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  NgbAccordionModule,
  NgbActiveModal,
  NgbModal,
  NgbModalModule,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap'
import { HttpClientModule } from '@angular/common/http'
import { TextComponent } from '../input/text/text.component'
import { PasswordComponent } from '../input/password/password.component'
import { of, throwError } from 'rxjs'
import { ToastService } from 'src/app/services/toast.service'
import { By } from '@angular/platform-browser'

const profile = {
  email: 'foo@bar.com',
  password: '*********',
  first_name: 'foo',
  last_name: 'bar',
}

describe('ProfileEditDialogComponent', () => {
  let component: ProfileEditDialogComponent
  let fixture: ComponentFixture<ProfileEditDialogComponent>
  let profileService: ProfileService
  let toastService: ToastService

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProfileEditDialogComponent,
        TextComponent,
        PasswordComponent,
      ],
      providers: [NgbActiveModal],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModalModule,
        NgbAccordionModule,
      ],
    })
    profileService = TestBed.inject(ProfileService)
    toastService = TestBed.inject(ToastService)
    fixture = TestBed.createComponent(ProfileEditDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should get profile on init, display in form', () => {
    const getSpy = jest.spyOn(profileService, 'get')
    getSpy.mockReturnValue(of(profile))
    component.ngOnInit()
    expect(getSpy).toHaveBeenCalled()
    fixture.detectChanges()
    expect(component.form.get('email').value).toEqual(profile.email)
  })

  it('should update profile on save, display error if needed', () => {
    const newProfile = {
      email: 'foo@bar2.com',
      password: profile.password,
      first_name: 'foo2',
      last_name: profile.last_name,
    }
    const updateSpy = jest.spyOn(profileService, 'update')
    const errorSpy = jest.spyOn(toastService, 'showError')
    updateSpy.mockReturnValueOnce(throwError(() => new Error('failed to save')))
    component.save()
    expect(errorSpy).toHaveBeenCalled()

    updateSpy.mockClear()
    const infoSpy = jest.spyOn(toastService, 'showInfo')
    component.form.patchValue(newProfile)
    updateSpy.mockReturnValueOnce(of(newProfile))
    component.save()
    expect(updateSpy).toHaveBeenCalledWith(newProfile)
    expect(infoSpy).toHaveBeenCalled()
  })

  it('should close on cancel', () => {
    const closeSpy = jest.spyOn(component.activeModal, 'close')
    component.cancel()
    expect(closeSpy).toHaveBeenCalled()
  })

  it('should show additional confirmation field when email changes, warn with error & disable save', () => {
    expect(component.form.get('email_confirm').enabled).toBeFalsy()
    const getSpy = jest.spyOn(profileService, 'get')
    getSpy.mockReturnValue(of(profile))
    component.ngOnInit()
    component.form.get('email').patchValue('foo@bar2.com')
    component.onEmailKeyUp({ target: { value: 'foo@bar2.com' } } as any)
    fixture.detectChanges()
    expect(component.form.get('email_confirm').enabled).toBeTruthy()
    expect(fixture.debugElement.nativeElement.textContent).toContain(
      'Emails must match'
    )
    expect(component.saveDisabled).toBeTruthy()

    component.form.get('email_confirm').patchValue('foo@bar2.com')
    component.onEmailConfirmKeyUp({ target: { value: 'foo@bar2.com' } } as any)
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.textContent).not.toContain(
      'Emails must match'
    )
    expect(component.saveDisabled).toBeFalsy()

    component.form.get('email').patchValue(profile.email)
    fixture.detectChanges()
    expect(component.form.get('email_confirm').enabled).toBeFalsy()
    expect(fixture.debugElement.nativeElement.textContent).not.toContain(
      'Emails must match'
    )
    expect(component.saveDisabled).toBeFalsy()
  })

  it('should show additional confirmation field when password changes, warn with error & disable save', () => {
    expect(component.form.get('password_confirm').enabled).toBeFalsy()
    const getSpy = jest.spyOn(profileService, 'get')
    getSpy.mockReturnValue(of(profile))
    component.ngOnInit()
    component.form.get('password').patchValue('new*pass')
    component.onPasswordKeyUp({ target: { value: 'new*pass' } } as any)
    fixture.detectChanges()
    expect(component.form.get('password_confirm').enabled).toBeTruthy()
    expect(fixture.debugElement.nativeElement.textContent).toContain(
      'Passwords must match'
    )
    expect(component.saveDisabled).toBeTruthy()

    component.form.get('password_confirm').patchValue('new*pass')
    component.onPasswordConfirmKeyUp({ target: { value: 'new*pass' } } as any)
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.textContent).not.toContain(
      'Passwords must match'
    )
    expect(component.saveDisabled).toBeFalsy()

    component.form.get('password').patchValue(profile.password)
    fixture.detectChanges()
    expect(component.form.get('password_confirm').enabled).toBeFalsy()
    expect(fixture.debugElement.nativeElement.textContent).not.toContain(
      'Passwords must match'
    )
    expect(component.saveDisabled).toBeFalsy()
  })
})