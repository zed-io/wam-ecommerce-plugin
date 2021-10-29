import * as React from "react";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "styled-components";
import ProfileForm from "../../components/ProfileForm";
import SettingsForm from "../../components/SettingsForm";
import EmptyState from "../../components/EmptyState";
import {
  adminUpdateProfile,
  adminUpdateSettings,
  adminSaveData
} from "../../redux/_admin";
import { notificationShow } from "../../redux/_notification";

const SSettingsWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
`;

const SSettingsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
`;

class Settings extends React.Component<any, any> {
  public static propTypes = {
    loading: PropTypes.bool.isRequired,
    address: PropTypes.string.isRequired,
    profile: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
  };

  public render() {
    const { loading, address, profile, settings } = this.props;
    return (
      <React.Fragment>
        {address ? (
          <SSettingsWrapper>
            <SSettingsSection>
              <ProfileForm
                title={`Profile`}
                profile={profile}
                onInputChange={this.props.adminUpdateProfile}
                onInputSubmit={this.props.adminSaveData}
              />
            </SSettingsSection>
            <SSettingsSection>
              <SettingsForm
                settings={settings}
                onInputChange={this.props.adminUpdateSettings}
                onInputSubmit={this.props.adminSaveData}
                onNotification={this.props.notificationShow}
              />
            </SSettingsSection>
          </SSettingsWrapper>
        ) : (
          <EmptyState loading={loading} message={`No Settings Data`} />
        )}
      </React.Fragment>
    );
  }
}

const reduxProps = (store: any) => ({
  loading: store.admin.loading,
  address: store.admin.address,
  profile: store.admin.profile,
  settings: store.admin.settings
});

export default connect(
  reduxProps,
  {
    adminUpdateProfile,
    adminUpdateSettings,
    adminSaveData,
    notificationShow
  }
)(Settings);
