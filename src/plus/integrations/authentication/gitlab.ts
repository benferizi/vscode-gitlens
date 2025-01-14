import type { Disposable, QuickInputButton } from 'vscode';
import { env, ThemeIcon, Uri, window } from 'vscode';
import { HostingIntegrationId, SelfHostedIntegrationId } from '../../../constants.integrations';
import type { Container } from '../../../container';
<<<<<<< HEAD
import type { ConfiguredIntegrationService } from './configuredIntegrationService';
import type { IntegrationAuthenticationSessionDescriptor } from './integrationAuthenticationProvider';
=======
import type {
	IntegrationAuthenticationService,
	IntegrationAuthenticationSessionDescriptor,
} from './integrationAuthentication';
>>>>>>> fad5b9277 (Stores and uses stored values for configured integration descriptors)
import {
	CloudIntegrationAuthenticationProvider,
	LocalIntegrationAuthenticationProvider,
} from './integrationAuthenticationProvider';
import type { IntegrationAuthenticationService } from './integrationAuthenticationService';
import type { ProviderAuthenticationSession } from './models';

type GitLabId = HostingIntegrationId.GitLab | SelfHostedIntegrationId.GitLabSelfHosted;

export class GitLabLocalAuthenticationProvider extends LocalIntegrationAuthenticationProvider<GitLabId> {
	constructor(
		container: Container,
		authenticationService: IntegrationAuthenticationService,
<<<<<<< HEAD
		configuredIntegrationService: ConfiguredIntegrationService,
		protected readonly authProviderId: GitLabId,
	) {
		super(container, authenticationService, configuredIntegrationService);
=======
		protected readonly authProviderId: GitLabId,
	) {
		super(container, authenticationService);
>>>>>>> fad5b9277 (Stores and uses stored values for configured integration descriptors)
	}

	override async createSession(
		descriptor: IntegrationAuthenticationSessionDescriptor,
	): Promise<ProviderAuthenticationSession | undefined> {
		const input = window.createInputBox();
		input.ignoreFocusOut = true;

		const disposables: Disposable[] = [];

		let token;
		try {
			const infoButton: QuickInputButton = {
				iconPath: new ThemeIcon(`link-external`),
				tooltip: 'Open the GitLab Access Tokens Page',
			};

			token = await new Promise<string | undefined>(resolve => {
				disposables.push(
					input.onDidHide(() => resolve(undefined)),
					input.onDidChangeValue(() => (input.validationMessage = undefined)),
					input.onDidAccept(() => {
						const value = input.value.trim();
						if (!value) {
							input.validationMessage = 'A personal access token is required';
							return;
						}

						resolve(value);
					}),
					input.onDidTriggerButton(e => {
						if (e === infoButton) {
							void env.openExternal(
								Uri.parse(`https://${descriptor.domain}/-/profile/personal_access_tokens`),
							);
						}
					}),
				);

				input.password = true;
				input.title = `GitLab Authentication  \u2022 ${descriptor.domain}`;
				input.placeholder = `Requires ${descriptor.scopes.join(', ')} scopes`;
				input.prompt = `Paste your [GitLab Personal Access Token](https://${
					descriptor.domain
				}/-/user_settings/personal_access_tokens?name=GitLens+Access+token&scopes=${descriptor.scopes.join(
					',',
				)} "Get your GitLab Access Token")`;
				input.buttons = [infoButton];

				input.show();
			});
		} finally {
			input.dispose();
			disposables.forEach(d => void d.dispose());
		}

		if (!token) return undefined;

		return {
			id: this.configuredIntegrationService.getSessionId(descriptor),
			accessToken: token,
			scopes: descriptor?.scopes ?? [],
			account: {
				id: '',
				label: '',
			},
			cloud: false,
			domain: descriptor.domain,
		};
	}
}

export class GitLabSelfHostedCloudAuthenticationProvider extends CloudIntegrationAuthenticationProvider<SelfHostedIntegrationId.CloudGitLabSelfHosted> {
	protected override get authProviderId(): SelfHostedIntegrationId.CloudGitLabSelfHosted {
		return SelfHostedIntegrationId.CloudGitLabSelfHosted;
	}
}

export class GitLabCloudAuthenticationProvider extends CloudIntegrationAuthenticationProvider<GitLabId> {
	protected override get authProviderId(): GitLabId {
		return HostingIntegrationId.GitLab;
	}
}
