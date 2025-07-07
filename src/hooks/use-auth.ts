import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from './';
import {
  useGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from '@/store/api/auth-api';
import { useToast } from './use-toast';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  //   const { toast } = useToast();

  const auth = useAppSelector(state => state.auth);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();

  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUserQuery();
};
