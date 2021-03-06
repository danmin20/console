import { store } from '@/store';
import router from '@/routes';


abstract class Authenticator {
    static async signIn(userId, credentials, userType?): Promise<void> {
        await store.dispatch('user/signIn', {
            domainId: store.state.domain.domainId,
            userType: userType || 'USER',
            userId,
            credentials,
        });
    }

    static async signOut(): Promise<void> {
        try {
            await router.app.$store.dispatch('user/signOut');
        } catch (e) {
            console.error('user sign out failed', e);
        }
    }
}


export {
    Authenticator,
};
