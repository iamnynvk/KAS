import { showFeedback } from "../../Slice/feedbackSlice";
import { updateAccessToken } from "../../Slice/userSlice";
import axiosInstance from "./axiosInstance";

/**
 * @param url will contain GET request url endpoints.
 * @returns if response got success when return resolve body otherwise error portion render it.
 */
export const makeAuthenticatedGetRequest = (url: string): any => {
  return async (dispatch: any, getState: any) => {
    const state: any = getState();
    const { language } = state.Preference;
    console.log("Access-Token GET Request---->", url);
    return new Promise((resolve, reject) => {
      axiosInstance
        .get(url, {
          headers: {
            Authorization:
              state?.user?.accessToken && "Bearer " + state?.user?.accessToken,
          },
        })
        .then(function (response) {
          const returnValue = {
            type: "success",
            data: response.data,
          };
          response?.data?.results?.no_active_project &&
            dispatch(
              showFeedback({
                type: "error",
                message: response.data.message,
              })
            );
          return resolve(returnValue);
        })
        .catch(async function (error) {
          if (error.response) {
            const status: any = error.response.status;
            const dataError: any = error.response.data;
            switch (status) {
              case 401:
                await dispatch(updateAccessToken(state?.user?.refreshToken));
                const response = dispatch(makeAuthenticatedGetRequest(url));
                return resolve(response);
              case 403:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.severForbiddenError,
                  })
                );
                return reject(error);
              case 404:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverNotFoundError,
                  })
                );
                return reject(error);
              case 500:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverGenericError,
                  })
                );
                return reject(error);
              default:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.generalError,
                  })
                );
                return reject(error);
            }
          } else if (error.request) {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverRequestError,
              })
            );
            return reject(error);
          } else {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverGenericError,
              })
            );
            return reject(error);
          }
        });
    });
  };
};

/**
 * @param url will contain POST request url endpoints.
 * @param data also passing params data.
 * @returns if response got success when return resolve body otherwise error portion render it.
 */
export const makeAuthenticatedPostRequest = (url: string, data: any): any => {
  return async (dispatch: any, getState: any) => {
    const state: any = getState();
    const { language } = state.Preference;
    console.log("Access-Token POST Request ---->", state?.user?.accessToken);
    return new Promise((resolve, reject) => {
      axiosInstance
        .post(url, data, {
          headers: {
            Authorization:
              state?.user?.accessToken && "Bearer " + state?.user?.accessToken,
          },
        })
        .then(function (response) {
          const returnValue = {
            type: "success",
            data: response.data,
          };
          dispatch(
            showFeedback({
              type:
                response?.data?.results?.is_checkin_required ||
                response?.data?.results?.no_active_project
                  ? "error"
                  : "success",
              message: response.data.message,
            })
          );
          return resolve(returnValue);
        })
        .catch(async function (error) {
          if (error?.response) {
            const status: any = error.response.status;
            const dataError: any = error.response.data;
            switch (status) {
              case 400:
                dispatch(
                  showFeedback({
                    type: "error",
                    message:
                      dataError?.results?.detail[0] || dataError?.detail[0],
                  })
                );
                return reject(error);
              case 401:
                await dispatch(updateAccessToken(state?.user?.refreshToken));
                const response = dispatch(
                  makeAuthenticatedPostRequest(url, data)
                );
                return resolve(response);
              case 403:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.severForbiddenError,
                  })
                );
                return reject(error);
              case 404:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverNotFoundError,
                  })
                );
                return reject(error);
              case 500:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverGenericError,
                  })
                );
                return reject(error);
              default:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.generalError,
                  })
                );
                return reject(error);
            }
          } else if (error.request) {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverRequestError,
              })
            );
            return reject(error);
          } else {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverGenericError,
              })
            );
            return reject(error);
          }
        });
    });
  };
};

/**
 *
 * @param url will contain PATCH request url endpoints.
 * @param data also passing params data.
 * @returns if response got success when return resolve body otherwise error portion render it.
 */
export const makeAuthenticatedPatchRequest = (
  url: string,
  data: any = {}
): any => {
  return async (dispatch: any, getState: any) => {
    const state: any = getState();
    const { language } = state.Preference;
    console.log("Access-Token PATCH Request ---->", state?.user?.accessToken);
    return new Promise((resolve, reject) => {
      axiosInstance
        .patch(url, data, {
          headers: {
            Authorization:
              state?.user?.accessToken && "Bearer " + state?.user?.accessToken,
          },
        })
        .then(function (response) {
          const returnValue = {
            type: "success",
            data: response.data,
          };
          dispatch(
            showFeedback({
              type: response?.data?.results?.is_checkin_required
                ? "error"
                : "success",
              message: response.data.message,
            })
          );
          return resolve(returnValue);
        })
        .catch(async function (error) {
          if (error?.response) {
            const status: any = error.response.status;
            const dataError: any = error.response.data;
            switch (status) {
              case 400:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: dataError?.results?.detail[0],
                  })
                );
                return reject(error);
              case 401:
                await dispatch(updateAccessToken(state?.user?.refreshToken));
                const response = dispatch(
                  makeAuthenticatedPatchRequest(url, data)
                );
                return resolve(response);
              case 403:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.severForbiddenError,
                  })
                );
                return reject(error);
              case 404:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverNotFoundError,
                  })
                );
                return reject(error);
              case 500:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.serverGenericError,
                  })
                );
                return reject(error);
              default:
                dispatch(
                  showFeedback({
                    type: "error",
                    message: language.generalError,
                  })
                );
                return reject(error);
            }
          } else if (error.request) {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverRequestError,
              })
            );
            return reject(error);
          } else {
            dispatch(
              showFeedback({
                type: "error",
                message: language.serverGenericError,
              })
            );
            return reject(error);
          }
        });
    });
  };
};
